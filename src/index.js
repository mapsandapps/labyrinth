import _ from 'lodash'
import Phaser from 'phaser'
import spritesheet from './assets/spritesheet.png'
import playerSprite from './assets/player-sprites.png'

const MIN_LEVEL = 1 // for easy testing, set both these to test level
const NUMBER_OF_LEVELS = 12
const PLAYER_SPEED = 175

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
let level
let player
let worldLayer

function init() {
  let possibleNextLevel = _.random(MIN_LEVEL, NUMBER_OF_LEVELS)
  while (`map${possibleNextLevel}` === level) { // don't choose the same level twice
    possibleNextLevel = _.random(MIN_LEVEL, NUMBER_OF_LEVELS)
  }
  level = `map${possibleNextLevel}`
}

function preload() {
  this.load.spritesheet('player', playerSprite, { frameWidth: 64, frameHeight: 54 })
  this.load.image('tiles', spritesheet)
  this.load.tilemapTiledJSON(level, `./src/assets/maps/${level}.json`)
}

function create() {
  const map = this.make.tilemap({ key: level })
  const tiles = map.addTilesetImage('spritesheet', 'tiles')

  map.createStaticLayer('Background', tiles, 0, 0)
  worldLayer = map.createStaticLayer('World', tiles, 0, 0)

  worldLayer.setCollisionBetween(0, 119)

  const startPoint = map.findObject('Objects', obj => obj.name === 'Start')
  endPoint = map.findObject('Objects', obj => obj.name === 'Finish')

  player = this.physics.add
    .sprite(startPoint.x, startPoint.y, 'player', 6)
    .setSize(32, 32)
    .setOffset(16, 16)
  player.setBounce(0.2)

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('player', { start: 1, end: 3 }),
    frameRate: 10,
    repeat: -1,
    yoyo: true
  })

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('player', { start: 1, end: 3 }),
    frameRate: 10,
    repeat: -1,
    yoyo: true
  })

  this.anims.create({
    key: 'up',
    frames: this.anims.generateFrameNumbers('player', { start: 7, end: 8 }),
    frameRate: 10,
    repeat: -1
  })

  this.anims.create({
    key: 'down',
    frames: this.anims.generateFrameNumbers('player', { start: 4, end: 5 }),
    frameRate: 10,
    repeat: -1
  })

  this.anims.create({
    key: 'win',
    frames: this.anims.generateFrameNumbers('player', { frames: [0, 4, 6] }),
    frameRate: 10,
    repeat: 3,
    yoyo: true
  })

  this.physics.add.collider(player, worldLayer)

  map.setTileIndexCallback(_.range(120), levelCollisionHandler, this)

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

function levelCollisionHandler(player, tile) {
  if (player.body.velocity.x) {
    if (player.body.velocity.x > 0) {
      // moving right
      player.anims.play('right', true)
      // TODO: change these to properties on tiles e.g. preventRight
      if (tile.properties.preventRight) {
        // once the player's position is in the middle of the tile, player.body.setVelocity(0)
        if (player.x >= tile.pixelX + (tile.layer.tileWidth / 2)) {
          stopPlayerMovement(player, tile, this)
        }
      }
    } else {
      // moving left
      player.anims.play('left', true)
      if (tile.properties.preventLeft) {
        if (player.x <= tile.pixelX + (tile.layer.tileWidth / 2)) {
          stopPlayerMovement(player, tile, this)
        }
      }
    }
  } if (player.body.velocity.y) {
    if (player.body.velocity.y > 0) {
      // moving down
      player.anims.play('down', true)
      if (tile.properties.preventDown) {
        if (player.y >= tile.pixelY + (tile.layer.tileHeight / 2)) {
          stopPlayerMovement(player, tile, this)
        }
      }
    } else {
      // moving up
      player.anims.play('up', true)
      if (tile.properties.preventUp) {
        if (player.y <= tile.pixelY + (tile.layer.tileHeight / 2)) {
          stopPlayerMovement(player, tile, this)
        }
      }
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
    } else if (cursors.right.isDown) {
      player.body.setVelocityX(PLAYER_SPEED);
    }

    // Vertical movement
    else if (cursors.up.isDown) {
      player.body.setVelocityY(-PLAYER_SPEED);
    } else if (cursors.down.isDown) {
      player.body.setVelocityY(PLAYER_SPEED);
    }
  }
}
