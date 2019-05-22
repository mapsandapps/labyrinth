import _ from 'lodash'
import Phaser from 'phaser'
import playerSprite from './assets/player-sprites.png'
import spritesheet from './assets/green-on-blue.png'

const MIN_LEVEL = 13 // for easy testing, set both these to test level
const NUMBER_OF_LEVELS = 13
const PLAYER_SPEED = 250
const TRAIL_TILE = 16

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 640,
  height: 448,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 0
      }
    }
  },
  scene: {
    init,
    preload,
    create,
    update
  }
}

const game = new Phaser.Game(config)
let cursors
let endPoint
let lastTileCollidedWith
let lastTileEntered
let level
let player
let visitedLayer
let worldLayer

function init() {
  let possibleNextLevel = _.random(MIN_LEVEL, NUMBER_OF_LEVELS)
  if (NUMBER_OF_LEVELS === MIN_LEVEL) {
    // only one level to pick from
    level = `map${MIN_LEVEL}`
  } else {
    while (`map${possibleNextLevel}` === level) { // don't choose the same level twice
      possibleNextLevel = _.random(MIN_LEVEL, NUMBER_OF_LEVELS)
    }
    level = `map${possibleNextLevel}`
  }
}

function preload() {
  this.load.spritesheet('player', playerSprite, { frameWidth: 32, frameHeight: 32 })
  this.load.image('green-on-blue', spritesheet)
  this.load.tilemapTiledJSON(level, `./src/assets/maps/${level}.json`)
}

function create() {
  const map = this.make.tilemap({ key: level })
  const tiles = map.addTilesetImage('green-on-blue', 'green-on-blue')

  map.createStaticLayer('Background', tiles, 0, 0)
  visitedLayer = map.createBlankDynamicLayer('Visited', tiles, 0, 0)
  worldLayer = map.createStaticLayer('World', tiles, 0, 0)

  worldLayer.setCollisionBetween(0, 119)

  const startPoint = map.findObject('Objects', obj => obj.name === 'Start')
  endPoint = map.findObject('Objects', obj => obj.name === 'Finish')

  player = this.physics.add
    .sprite(startPoint.x, startPoint.y, 'player', 3)
    .setSize(32, 32)
    .setOffset(16, 16)
  player.setBounce(0.2)

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('player', { frames: [12, 13, 12, 14] }),
    frameRate: 10,
    repeat: -1
  })

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('player', { frames: [6, 7, 6, 8] }),
    frameRate: 10,
    repeat: -1
  })

  this.anims.create({
    key: 'up',
    frames: this.anims.generateFrameNumbers('player', { frames: [3, 4, 3, 5] }),
    frameRate: 10,
    repeat: -1
  })

  this.anims.create({
    key: 'down',
    frames: this.anims.generateFrameNumbers('player', { frames: [9, 10, 9, 11] }),
    frameRate: 10,
    repeat: -1
  })

  this.anims.create({
    key: 'win',
    frames: this.anims.generateFrameNumbers('player', { frames: [1, 2] }),
    frameRate: 10,
    repeat: 3,
    yoyo: true
  })

  this.physics.add.collider(player, worldLayer)

  map.setTileIndexCallback(_.range(120), levelCollisionHandler, this, worldLayer)

  const camera = this.cameras.main
  camera.startFollow(player)
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

  cursors = this.input.keyboard.createCursorKeys()

  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
}

function checkFinished(player, ctx) {
  if (player.x === endPoint.x && player.y === endPoint.y) {
    // TODO: should disable movement here
    player.anims.play('win', true)
    ctx.time.addEvent({
      delay: 2000,
      callback: () => ctx.scene.restart()
    })
  }
}

function stopPlayerMovement(player, tile, ctx) {
  player.anims.stop()
  const newX = tile.pixelX + (tile.layer.tileWidth / 2)
  const newY = tile.pixelY + (tile.layer.tileHeight / 2)
  player.body.reset(newX, newY) // ensures player doesn't get off by sub-pixels and sets velocity to 0

  checkFinished(player, ctx)
}

function enteringTile(tile, direction) {
  lastTileEntered = tile

  visitedLayer.putTileAt(TRAIL_TILE, tile.x, tile.y)
}

function collidingWithTile(tile, direction) {
  // if it collides with the same tile twice in a row, it's _only_ over that tile
  // TODO: instead, possibly see when it's passed the midpoint
  // swap if-statement order in levelCollisionHandler()
  if (!lastTileCollidedWith || !lastTileEntered) {
    enteringTile(tile, direction)
  } else if (tile.x === lastTileCollidedWith.x && tile.y === lastTileCollidedWith.y && !(tile.x === lastTileEntered.x && tile.y === lastTileEntered.y)) {
    enteringTile(tile, direction)
  }

  lastTileCollidedWith = tile
}

function levelCollisionHandler(player, tile) {
  if (player.body.velocity.x) {
    if (player.body.velocity.x > 0) {
      // moving right
      if (tile.properties.preventRight) {
        // once the player's position is in the middle of the tile, player.body.setVelocity(0)
        if (player.x >= tile.pixelX + (tile.layer.tileWidth / 2)) {
          stopPlayerMovement(player, tile, this)
        }
      }
      collidingWithTile(tile, { x: 1, y: 0 })
    } else {
      // moving left
      if (tile.properties.preventLeft) {
        if (player.x <= tile.pixelX + (tile.layer.tileWidth / 2)) {
          stopPlayerMovement(player, tile, this)
        }
      }
      collidingWithTile(tile, { x: -1, y: 0 })
    }
  } if (player.body.velocity.y) {
    if (player.body.velocity.y > 0) {
      // moving down
      if (tile.properties.preventDown) {
        if (player.y >= tile.pixelY + (tile.layer.tileHeight / 2)) {
          stopPlayerMovement(player, tile, this)
        }
      }
      collidingWithTile(tile, { x: 0, y: 1 })
    } else {
      // moving up
      if (tile.properties.preventUp) {
        if (player.y <= tile.pixelY + (tile.layer.tileHeight / 2)) {
          stopPlayerMovement(player, tile, this)
        }
      }
      collidingWithTile(tile, { x: 0, y: -1 })
    }
  }
}

function update(time, delta) {
  if (!player || !player.body) {
    return // when starting a new level, update fires before create
  }
  if (player.body.velocity.x === 0 && player.body.velocity.y === 0) {
    // only allow the player to move once they're stopped

    // Horizontal movement
    if (cursors.left.isDown) {
      player.body.setVelocityX(-PLAYER_SPEED);
      player.anims.play('left', true)
    } else if (cursors.right.isDown) {
      player.body.setVelocityX(PLAYER_SPEED);
      player.anims.play('right', true)
    }

    // Vertical movement
    else if (cursors.up.isDown) {
      player.body.setVelocityY(-PLAYER_SPEED);
      player.anims.play('up', true)
    } else if (cursors.down.isDown) {
      player.body.setVelocityY(PLAYER_SPEED);
      player.anims.play('down', true)
    }
  }
}
