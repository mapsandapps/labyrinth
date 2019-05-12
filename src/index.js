import _ from 'lodash'
import Phaser from 'phaser'
import spritesheet from './assets/spritesheet.png'
import playerImg from './assets/player.png'

const NUMBER_OF_LEVELS = 3
const PLAYER_SPEED = 800; // 175

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
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
  let possibleNextLevel = _.random(1, NUMBER_OF_LEVELS)
  while (possibleNextLevel === level) { // don't choose the same level twice
    possibleNextLevel = _.random(1, NUMBER_OF_LEVELS)
  }
  level = possibleNextLevel
}

function preload() {
  this.load.image('player', playerImg)
  this.load.image('tiles', spritesheet)
  this.load.tilemapTiledJSON('map', `./src/assets/maps/map${level}.json`) // FIXME: do i need to invalidate a cache here or something?
}

function create() {
  const map = this.make.tilemap({ key: 'map' })
  const tiles = map.addTilesetImage('spritesheet', 'tiles')

  map.createStaticLayer('Background', tiles, 0, 0)
  worldLayer = map.createStaticLayer('World', tiles, 0, 0)

  worldLayer.setCollisionBetween(0, 119)

  const startPoint = map.findObject('Objects', obj => obj.name === 'Start')
  endPoint = map.findObject('Objects', obj => obj.name === 'Finish')

  player = this.physics.add
    .sprite(startPoint.x, startPoint.y, 'player')
    .setSize(32, 32)
    .setOffset(16, 16)

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
    ctx.scene.restart()
  }
}

function stopPlayerMovement(player, tile, ctx) {
  const newX = tile.pixelX + (tile.layer.tileWidth / 2)
  const newY = tile.pixelY + (tile.layer.tileHeight / 2)
  player.body.reset(newX, newY) // ensures player doesn't get off by sub-pixels and sets velocity to 0

  checkFinished(player, ctx)
}

function levelCollisionHandler(player, tile) {
  if (player.body.velocity.x) {
    if (player.body.velocity.x > 0) {
      // moving right
      // TODO: change these to properties on tiles e.g. preventRight
      if (tile.properties.preventRight) {
        // once the player's position is in the middle of the tile, player.body.setVelocity(0)
        if (player.x >= tile.pixelX + (tile.layer.tileWidth / 2)) {
          stopPlayerMovement(player, tile, this)
        }
      }
    } else {
      // moving left
      if (tile.properties.preventLeft) {
        if (player.x <= tile.pixelX + (tile.layer.tileWidth / 2)) {
          stopPlayerMovement(player, tile, this)
        }
      }
    }
  } if (player.body.velocity.y) {
    if (player.body.velocity.y > 0) {
      // moving down
      if (tile.properties.preventDown) {
        if (player.y >= tile.pixelY + (tile.layer.tileHeight / 2)) {
          stopPlayerMovement(player, tile, this)
        }
      }
    } else {
      // moving up
      if (tile.properties.preventUp) {
        if (player.y <= tile.pixelY + (tile.layer.tileHeight / 2)) {
          stopPlayerMovement(player, tile, this)
        }
      }
    }
  }
}

function update(time, delta) {

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
