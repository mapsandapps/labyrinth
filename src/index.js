import Phaser from 'phaser'
import colored from './assets/spritesheet_tiles.png'
import playerImg from './assets/player.png'

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 512,
  height: 512,
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
let layer
let player

function preload() {
  this.load.image('player', playerImg)
  this.load.image('tiles', colored)
}

function init() {
}

function create() {
  const level = [
    [ 11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11 ],
    [ 11,   9,  11,   0,   1,   2,  11,   8,   9,  32,  11 ],
    [ 11,   3,  58,   3,  11,   3,  11,   5,  58, 114,  11 ],
    [ 11,   3,  10,   4,   1,   8,  11,  11,  11,  11,  11 ],
    [ 11,   6,   1,   8,  33,  10,  11,  11,  11,  11,  11 ],
    [ 11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11 ],
    [ 11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11 ],
    [ 11,  11,  10,  10,  10,  10,  10,  11,  11,  11, 111 ],
    [ 11,  11,  11,  11,  11,  11,  11,  11,  11,  32, 111 ],
    [ 35,  36,  37,  11,  11,  11,  11,  11,  32,  32,  21 ],
    [ 39,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ]
  ]

  // When loading from an array, make sure to specify the tileWidth and tileHeight
  const map = this.make.tilemap({ data: level, tileWidth: 64, tileHeight: 64 })
  const tiles = map.addTilesetImage("tiles", null, 64, 64, 0, 0)
  layer = map.createStaticLayer(0, tiles, 0, 0)

  layer.setCollision([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])

  player = this.physics.add
    .sprite(96, 96, 'player')
    .setSize(32, 32)
    .setOffset(16, 16)

  this.physics.add.collider(player, layer)

  map.setTileIndexCallback([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], levelCollisionHandler, this)

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
      if (tile.index === 2 || tile.index === 3 || tile.index === 5 || tile.index === 7 || tile.index === 8 || tile.index === 9) {
        // once the player's position is in the middle of the tile, player.body.setVelocity(0)
        if (player.x >= tile.pixelX + (tile.layer.tileWidth / 2)) {
          stopPlayerMovement(player, tile)
        }
      }
    } else {
      // moving left
      if (tile.index === 0 || tile.index === 3 || tile.index === 6 || tile.index === 7 || tile.index === 9 || tile.index === 10) {
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
      if (tile.index === 1 || tile.index === 5 || tile.index === 6 || tile.index === 7 || tile.index === 8 || tile.index === 10) {
        if (player.y >= tile.pixelY + (tile.layer.tileHeight / 2)) {
          stopPlayerMovement(player, tile)
        }
      }
    } else {
      // moving up
      if (tile.index === 0 || tile.index === 1 || tile.index === 2 || tile.index === 5 || tile.index === 10 || tile.index === 9) {
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
