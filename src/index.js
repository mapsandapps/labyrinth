import _ from 'lodash'
import Phaser from 'phaser'
import spritesheet from './assets/spritesheet.png'
import playerImg from './assets/player.png'
import map from './assets/maps/map3.json'

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
    preload,
    init,
    create,
    update
  }
}

const game = new Phaser.Game(config)
let cursors
let worldLayer
let player

function preload() {
  this.load.image('player', playerImg)
  this.load.image('tiles', spritesheet)
  this.load.tilemapTiledJSON('map', map)
}

function init() {
}

function create() {
  // When loading from an array, make sure to specify the tileWidth and tileHeight
  const map = this.make.tilemap({ key: 'map' })
  const tiles = map.addTilesetImage('spritesheet', 'tiles')

  const backgroundLayer = map.createStaticLayer("Background", tiles, 0, 0)
  worldLayer = map.createStaticLayer("World", tiles, 0, 0)

  worldLayer.setCollisionBetween(0, 119)

  player = this.physics.add
    .sprite(416, 96, 'player')
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

function stopPlayerMovement(player, tile) {
  const newX = tile.pixelX + (tile.layer.tileWidth / 2)
  const newY = tile.pixelY + (tile.layer.tileHeight / 2)
  player.body.reset(newX, newY) // ensures player doesn't get off by sub-pixels and sets velocity to 0
  console.log('stop!')
  console.log(player)
  console.log(tile)
}

function levelCollisionHandler(player, tile) {
  if (player.body.velocity.x) {
    if (player.body.velocity.x > 0) {
      // moving right
      // TODO: change these to properties on tiles e.g. preventRight
      if (tile.properties.preventRight) {
        // once the player's position is in the middle of the tile, player.body.setVelocity(0)
        if (player.x >= tile.pixelX + (tile.layer.tileWidth / 2)) {
          stopPlayerMovement(player, tile)
        }
      }
    } else {
      // moving left
      if (tile.properties.preventLeft) {
        if (player.x <= tile.pixelX + (tile.layer.tileWidth / 2)) {
          stopPlayerMovement(player, tile)
        }
      }
    }
    // console.log(player)
    // console.log(tile)
  } if (player.body.velocity.y) {
    if (player.body.velocity.y > 0) {
      // moving down
      if (tile.properties.preventDown) {
        if (player.y >= tile.pixelY + (tile.layer.tileHeight / 2)) {
          stopPlayerMovement(player, tile)
        }
      }
    } else {
      // moving up
      if (tile.properties.preventUp) {
        if (player.y <= tile.pixelY + (tile.layer.tileHeight / 2)) {
          stopPlayerMovement(player, tile)
        }
      }
    }
  }
}

function update(time, delta) {
  const speed = 175;

  if (player.body.velocity.x === 0 && player.body.velocity.y === 0) {
    // only allow the player to move once they're stopped

    // Horizontal movement
    if (cursors.left.isDown) {
      player.body.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
      player.body.setVelocityX(speed);
    }

    // Vertical movement
    else if (cursors.up.isDown) {
      player.body.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
      player.body.setVelocityY(speed);
    }
  }
}

// function gameOver() {
//   game.restart()
// }
