import _ from 'lodash'
import Phaser from 'phaser'

import dirt from './assets/dirt.png'
import flame from './assets/flame-quarter-size.png'
import footprints from './assets/footprints.png'
import playerSprite from './assets/player-sprites.png'
import spritesheet from './assets/spritesheet.png'

const MIN_LEVEL = 1 // for easy testing, set both these to test level
const MAX_LEVEL = 12
const PLAYER_SPEED = 200 // 250 or less
const TRAIL_STYLE = 'footprints'

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
let leftFoot, rightFoot
let level
let player
let visitedLayer
let worldLayer

function init() {
  let possibleNextLevel = _.random(MIN_LEVEL, MAX_LEVEL)
  if (MAX_LEVEL === MIN_LEVEL) {
    // only one level to pick from
    level = `map${MIN_LEVEL}`
  } else {
    while (`map${possibleNextLevel}` === level) { // don't choose the same level twice
      possibleNextLevel = _.random(MIN_LEVEL, MAX_LEVEL)
    }
    level = `map${possibleNextLevel}`
  }
  console.log(`using level ${level}`)
}

function preload() {
  this.load.spritesheet('player', playerSprite, {
    frameWidth: 32,
    frameHeight: 32
  })
  this.load.image('spritesheet', spritesheet)
  this.load.tilemapTiledJSON(level, `./src/assets/maps/${level}.json`)

  if (TRAIL_STYLE === 'particle') {
    this.load.image('flame', flame)
  } else if (TRAIL_STYLE === 'footprints') {
    this.load.spritesheet('footprints', footprints, {
      frameWidth: 16,
      frameHeight: 16
    })
  }
}

function create() {
  const map = this.make.tilemap({ key: level })
  const tiles = map.addTilesetImage('spritesheet', 'spritesheet')

  map.createStaticLayer('Background', tiles, 0, 0)
  worldLayer = map.createStaticLayer('World', tiles, 0, 0)

  worldLayer.setCollisionBetween(0, 119)
  visitedLayer = map.createBlankDynamicLayer('Visited', tiles, 0, 0)

  const startPoint = map.findObject('Objects', obj => obj.name === 'Start')
  endPoint = map.findObject('Objects', obj => obj.name === 'Finish')

  if (TRAIL_STYLE === 'footprints') {
    var particles = this.add.particles('footprints')

    const initialEmitterConfig = {
      blendMode: 'ADD', // ADD, MULTIPLY, SCREEN, ERASE
      frame: 0,
      frequency: 200,
      lifespan: {
        min: 500,
        max: 1000
      },
      quantity: 1,
      speed: 0,
      tint: [ 0xffff00, 0xff0000, 0x00ff00, 0x0000ff ]
    }

    leftFoot = particles.createEmitter({ ...initialEmitterConfig,
      x: -8,
      y: -8
    })

    rightFoot = particles.createEmitter({ ...initialEmitterConfig,
      x: 8,
      y: 8
    })

    player = this.physics.add
      .sprite(startPoint.x, startPoint.y, 'player', 3)
      .setSize(32, 32)
      .setOffset(16, 16)
    player.setBounce(0.2)

    leftFoot.startFollow(player)
    rightFoot.startFollow(player)
    leftFoot.stop()
    rightFoot.stop()
  }

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
  if (TRAIL_STYLE === 'footprints') {
    leftFoot.stop()
    rightFoot.stop()
  }

  const newX = tile.pixelX + (tile.layer.tileWidth / 2)
  const newY = tile.pixelY + (tile.layer.tileHeight / 2)
  player.body.reset(newX, newY) // ensures player doesn't get off by sub-pixels and sets velocity to 0

  checkFinished(player, ctx)
}

function plopDownColor(tile) {
  let newTileIndex = 1
  if (tile.index >= 14 && tile.index <= 24) {
    newTileIndex = tile.index + (9 * 12)
  } else if (tile.index >= 26 && tile.index <= 60) {
    newTileIndex = tile.index % 12 + (11 * 12)
  } else if (tile.index >= 62 && tile.index <= 96) {
    newTileIndex = tile.index % 12 + (12 * 12)
  }
  visitedLayer.putTileAt(newTileIndex, tile.x, tile.y)
  const tileJustPlaced = visitedLayer.getTileAt(tile.x, tile.y)
  tileJustPlaced.tint = 0x026FEB
}

function enteringTile(tile, direction) {
  lastTileEntered = tile

  if (TRAIL_STYLE === 'color') {
    plopDownColor(tile)
  }
}

function collidingWithTile(tile, direction) {
  if (!lastTileCollidedWith || !lastTileEntered) {
    // first tile
    enteringTile(tile, direction)
  } else if (!(tile.x === lastTileEntered.x && tile.y === lastTileEntered.y)) {
    // new tile
    enteringTile(tile, direction)
  }

  lastTileCollidedWith = tile
}

function levelCollisionHandler(player, tile) {
  if (player.body.velocity.x) {
    if (player.body.velocity.x > 0) {
      // moving right
      if (player.x >= tile.pixelX + (tile.layer.tileWidth / 2)) {
        collidingWithTile(tile, { x: 1, y: 0 })
        if (tile.properties.preventRight) {
        // once the player's position is in the middle of the tile, player.body.setVelocity(0)
          stopPlayerMovement(player, tile, this)
        }
      }
    } else {
      // moving left
      if (player.x <= tile.pixelX + (tile.layer.tileWidth / 2)) {
        collidingWithTile(tile, { x: -1, y: 0 })
        if (tile.properties.preventLeft) {
          stopPlayerMovement(player, tile, this)
        }
      }
    }
  } if (player.body.velocity.y) {
    if (player.body.velocity.y > 0) {
      // moving down
      if (player.y >= tile.pixelY + (tile.layer.tileHeight / 2)) {
        collidingWithTile(tile, { x: 0, y: 1 })
        if (tile.properties.preventDown) {
          stopPlayerMovement(player, tile, this)
        }
      }
    } else {
      // moving up
      if (player.y <= tile.pixelY + (tile.layer.tileHeight / 2)) {
        collidingWithTile(tile, { x: 0, y: -1 })
        if (tile.properties.preventUp) {
          stopPlayerMovement(player, tile, this)
        }
      }
    }
  }
}

function movePlayer(direction) {
  let leftFootFrame

  if (direction === 'left') {
    player.body.setVelocityX(-PLAYER_SPEED)
    leftFootFrame = 6
  } else if (direction === 'right') {
    player.body.setVelocityX(PLAYER_SPEED)
    leftFootFrame = 2
  } else if (direction === 'up') {
    player.body.setVelocityY(-PLAYER_SPEED)
    leftFootFrame = 0
  } else if (direction === 'down') {
    player.body.setVelocityY(PLAYER_SPEED)
    leftFootFrame = 4
  }

  if (TRAIL_STYLE === 'footprints') {
    leftFoot.setFrame(leftFootFrame)
    rightFoot.setFrame(leftFootFrame + 1)
    leftFoot.start()
    rightFoot.start()
  }

  player.anims.play(direction, true)
}

function update(time, delta) {
  if (!player || !player.body) {
    return // when starting a new level, update fires before create
  }
  if (player.body.velocity.x === 0 && player.body.velocity.y === 0) {
    // only allow the player to move once they're stopped

    // Horizontal movement
    if (cursors.left.isDown) {
      movePlayer('left')
    } else if (cursors.right.isDown) {
      movePlayer('right')
    }

    // Vertical movement
    else if (cursors.up.isDown) {
      movePlayer('up')
    } else if (cursors.down.isDown) {
      movePlayer('down')
    }
  }
}
