import './reset.css'
import './index.css'

import _ from 'lodash'
import Phaser from 'phaser'

import flame from './assets/flame-quarter-size.png'
import footprints from './assets/footprints.png'
import playerSprite from './assets/player-sprites.png'
import spritesheet from './assets/spritesheet-extruded.png'

import backgrounds from './backgrounds.json'

const EMITTER_SPREAD = 90
const MIN_LEVEL = 1 // for easy testing, set both these to test level
const MAX_LEVEL = 15
const PLAYER_SPEED = 200 // 250 or less
const TRAIL_STYLE = 'particles' // color, footprints, particles

let mobileSized = window.innerWidth < 640

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: mobileSized ? window.innerWidth : 640,
  height: mobileSized ? window.innerHeight : 448,
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
let emitter
let endPoint
let lastTileCollidedWith
let lastTileEntered
let leftFoot, rightFoot
let level
let player
let randomBackground
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

  randomBackground = backgrounds[_.random(backgrounds.length - 1)]
}

function preload() {
  this.load.spritesheet('player', playerSprite, {
    frameWidth: 32,
    frameHeight: 32
  })
  this.load.image('background', `./src/assets/backgrounds/${randomBackground.filename}`)
  this.load.image('spritesheet', spritesheet)
  this.load.tilemapTiledJSON(level, `./src/assets/maps/${level}.json`)

  if (TRAIL_STYLE === 'particles') {
    this.load.image('flame', flame)
  } else if (TRAIL_STYLE === 'footprints') {
    this.load.spritesheet('footprints', footprints, {
      frameWidth: 16,
      frameHeight: 16
    })
  }
}

function getBackgroundScale(map, scrollFactor) {
  // x
  let neededImageWidth = game.scale.width * (1 + scrollFactor)
  let neededImageWidthScale = neededImageWidth / randomBackground.width

  // y
  let neededImageHeight = game.scale.height * (1 + scrollFactor)
  let neededImageHeightScale = neededImageHeight / randomBackground.height

  return _.ceil(_.max([neededImageWidthScale, neededImageHeightScale]), 1)
}

function create() {
  const map = this.make.tilemap({ key: level })
  const tiles = map.addTilesetImage('spritesheet', 'spritesheet', 64, 64, 1, 6)

  // add background image
  this.add.tileSprite(0, 0, randomBackground.width, randomBackground.height, 'background')
    .setScale(getBackgroundScale(map, 0.1))
    .setOrigin(0, 0)
    .setScrollFactor(0.1)

  // map.createStaticLayer('Background', tiles, 0, 0) // now using background images instead of tile layer
  worldLayer = map.createStaticLayer('World', tiles, 0, 0)

  worldLayer.setCollisionBetween(0, 119)
  visitedLayer = map.createBlankDynamicLayer('Visited', tiles, 0, 0)

  const startPoint = map.findObject('Objects', obj => obj.name === 'Start')
  endPoint = map.findObject('Objects', obj => obj.name === 'Finish')

  if (TRAIL_STYLE === 'footprints') {
    var particles = this.add.particles('footprints')

    const initialEmitterConfig = {
      alpha: 0.3,
      blendMode: 'MULTIPLY', // ADD, MULTIPLY, SCREEN, ERASE
      frame: 0,
      frequency: 200,
      lifespan: {
        min: 500,
        max: 1000
      },
      quantity: 1,
      speed: 0,
      tint: 0x000000
    }

    leftFoot = particles.createEmitter({ ...initialEmitterConfig,
      x: -8,
      y: -8
    })

    rightFoot = particles.createEmitter({ ...initialEmitterConfig,
      x: 8,
      y: 8
    })
  } else if (TRAIL_STYLE === 'particles') {
    var particles = this.add.particles('flame')

    emitter = particles.createEmitter({
      blendMode: 'ADD',
      frequency: 0,
      lifespan: {
        min: 500,
        max: 1000
      },
      quantity: 1,
      scale: 0.1,
      speed: 50,
      tint: [ 0xe30c0c, 0xff8c07, 0xffee03, 0x08832b, 0x0150fe, 0x750488 ]
    })
  }

  player = this.physics.add
    .sprite(startPoint.x, startPoint.y, 'player', 3)
    .setSize(32, 32)
    .setOffset(16, 16)
  player.setBounce(0.2)

  if (TRAIL_STYLE === 'footprints') {
    leftFoot.startFollow(player)
    rightFoot.startFollow(player)
    leftFoot.stop()
    rightFoot.stop()
  } else if (TRAIL_STYLE === 'particles') {
    emitter.startFollow(player)
    emitter.stop()
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

  this.input.on('pointerup', endSwipe, this)

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
  } else if (TRAIL_STYLE === 'particles') {
    emitter.stop()
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
  let emitterDirection

  if (direction === 'left') {
    player.body.setVelocityX(-PLAYER_SPEED)
    leftFootFrame = 6
    emitterDirection = 0
  } else if (direction === 'right') {
    player.body.setVelocityX(PLAYER_SPEED)
    leftFootFrame = 2
    emitterDirection = 180
  } else if (direction === 'up') {
    player.body.setVelocityY(-PLAYER_SPEED)
    leftFootFrame = 0
    emitterDirection = 90
  } else if (direction === 'down') {
    player.body.setVelocityY(PLAYER_SPEED)
    leftFootFrame = 4
    emitterDirection = 270
  }

  if (TRAIL_STYLE === 'footprints') {
    leftFoot.setFrame(leftFootFrame)
    rightFoot.setFrame(leftFootFrame + 1)
    leftFoot.start()
    rightFoot.start()
  } else if (TRAIL_STYLE === 'particles') {
    emitter.setAngle({
      min: emitterDirection - EMITTER_SPREAD / 2,
      max: emitterDirection + EMITTER_SPREAD / 2
    })
    emitter.start()
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

function endSwipe(e) {
  // with credit to https://www.emanueleferonato.com/2018/02/09/phaser-3-version-of-the-html5-swipe-controlled-sokoban-game/
  if (player.body.velocity.x === 0 && player.body.velocity.y === 0) {
    var swipeTime = e.upTime - e.downTime;
    var swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);
    var swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
    var swipeNormal = new Phaser.Geom.Point(swipe.x / swipeMagnitude, swipe.y / swipeMagnitude);
    if(swipeMagnitude > 20 && swipeTime < 1000 && (Math.abs(swipeNormal.y) > 0.8 || Math.abs(swipeNormal.x) > 0.8)) {
      if(swipeNormal.x > 0.8) {
        movePlayer('right')
      }
      if(swipeNormal.x < -0.8) {
        movePlayer('left')
      }
      if(swipeNormal.y > 0.8) {
        movePlayer('down')
      }
      if(swipeNormal.y < -0.8) {
        movePlayer('up')
      }
    }
  }
}
