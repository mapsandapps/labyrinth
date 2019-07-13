import { CONST } from './const'
import { forEach } from 'lodash'

import { Path } from '../objects/path'

interface Coordinates {
  x: number
  y: number
}

interface DirectionComponent {
  x: number
  y: number
  tile?: string
  radius?: number
}

let direction: number


function getCenter(tile: DirectionComponent): Coordinates {
  return {
    x: tile.x * CONST.TILE_SIZE + CONST.TILE_SIZE / 2,
    y: tile.y * CONST.TILE_SIZE + CONST.TILE_SIZE / 2
  }
}

function getTopCenter(tile: DirectionComponent): Coordinates {
  return {
    x: tile.x * CONST.TILE_SIZE + CONST.TILE_SIZE / 2,
    y: tile.y * CONST.TILE_SIZE
  }
}

function getRightCenter(tile: DirectionComponent): Coordinates {
  return {
    x: (tile.x + 1) * CONST.TILE_SIZE,
    y: tile.y * CONST.TILE_SIZE + CONST.TILE_SIZE / 2
  }
}

function getBottomCenter(tile: DirectionComponent): Coordinates {
  return {
    x: tile.x * CONST.TILE_SIZE + CONST.TILE_SIZE / 2,
    y: (tile.y + 1) * CONST.TILE_SIZE
  }
}

function getLeftCenter(tile: DirectionComponent): Coordinates {
  return {
    x: tile.x * CONST.TILE_SIZE,
    y: tile.y * CONST.TILE_SIZE + CONST.TILE_SIZE / 2
  }
}

function createStart(path: Path, firstTile: DirectionComponent) {
  path.moveTo(getCenter(firstTile).x, getCenter(firstTile).y)

  // starting tiles: set initial direction; draw line from center of tile to edge
  if (firstTile.tile === 'startUp') {
    direction = 0
    path.lineTo(getTopCenter(firstTile).x, getTopCenter(firstTile).y)
  }
  if (firstTile.tile === 'startRight') {
    direction = 90
    path.lineTo(getRightCenter(firstTile).x, getRightCenter(firstTile).y)
  }
  if (firstTile.tile === 'startDown') {
    direction = 180
    path.lineTo(getBottomCenter(firstTile).x, getBottomCenter(firstTile).y)
  }
  if (firstTile.tile === 'startLeft') {
    direction = -90
    path.lineTo(getLeftCenter(firstTile).x, getLeftCenter(firstTile).y)
  }
}

function createEnd(path: Path, lastTile: DirectionComponent) {
  path.lineTo(getCenter(lastTile).x, getCenter(lastTile).y)
}

function getSegment(path: Path, nextTile: DirectionComponent) {
  // TODO: make a check for if the point you're moving to is the same as the one you're already at
  direction = Phaser.Math.Angle.WrapDegrees(direction)

  // draw straight line
  if (direction === 0) {
    path.lineTo(getBottomCenter(nextTile).x, getBottomCenter(nextTile).y)
  } else if (direction === 90) {
    path.lineTo(getLeftCenter(nextTile).x, getLeftCenter(nextTile).y)
  } else if (direction === 180 || direction === -180) {
    path.lineTo(getTopCenter(nextTile).x, getTopCenter(nextTile).y)
  } else if (direction === -90) {
    path.lineTo(getRightCenter(nextTile).x, getRightCenter(nextTile).y)
  }

  if (nextTile.tile === 'turnLeft') {
    path.ellipseTo((nextTile.radius - 0.5) * CONST.TILE_SIZE, (nextTile.radius - 0.5) * CONST.TILE_SIZE, direction, direction - 90, true, 0)
    direction -= 90
  } else if (nextTile.tile === 'turnRight') {
    path.ellipseTo((nextTile.radius - 0.5) * CONST.TILE_SIZE, (nextTile.radius - 0.5) * CONST.TILE_SIZE, direction - 180, direction - 90, false, 0)
    direction += 90
  }
}

export function getDirections(path: Path, directions: Array<DirectionComponent>) {
  forEach(directions, (direction, i) => {
    if (i === 0) {
      createStart(path, direction)
    } else if (i === directions.length - 1) {
      createEnd(path, direction)
    } else {
      getSegment(path, direction)
    }
  })
}
