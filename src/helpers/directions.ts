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
  tile: string
}

let direction: string


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
  if (firstTile.tile === 'up') {
    direction = 'up'
    path.lineTo(getTopCenter(firstTile).x, getTopCenter(firstTile).y)
  }
  if (firstTile.tile === 'right') {
    direction = 'right'
    path.lineTo(getRightCenter(firstTile).x, getRightCenter(firstTile).y)
  }
  if (firstTile.tile === 'down') {
    direction = 'down'
    path.lineTo(getBottomCenter(firstTile).x, getBottomCenter(firstTile).y)
  }
  if (firstTile.tile === 'left') {
    direction = 'left'
    path.lineTo(getLeftCenter(firstTile).x, getLeftCenter(firstTile).y)
  }
}

function createEnd(path: Path, lastTile: DirectionComponent) {
  path.lineTo(getCenter(lastTile).x, getCenter(lastTile).y)
}

function getSegment(path: Path, nextTile: DirectionComponent) {
  // TODO: make a check for if the point you're moving to is the same as the one you're already at

  // draw straight line
  if (direction === 'up') {
    path.lineTo(getBottomCenter(nextTile).x, getBottomCenter(nextTile).y)
  } else if (direction === 'right') {
    path.lineTo(getLeftCenter(nextTile).x, getLeftCenter(nextTile).y)
  } else if (direction === 'down') {
    path.lineTo(getTopCenter(nextTile).x, getTopCenter(nextTile).y)
  } else if (direction === 'left') {
    path.lineTo(getRightCenter(nextTile).x, getRightCenter(nextTile).y)
  }

  // draw curved line
  if (nextTile.tile === 'rightDown') {
    if (direction === 'up') {
      path.ellipseTo(CONST.TILE_SIZE / 2, CONST.TILE_SIZE / 2, 180, 270, false, 0)
      direction = 'right'
    } else if (direction === 'left') {
      path.ellipseTo(CONST.TILE_SIZE / 2, CONST.TILE_SIZE / 2, 270, 180, true, 0)
      direction = 'down'
    }
  } else if (nextTile.tile === 'upLeft') {
    if (direction === 'right') {
      path.ellipseTo(CONST.TILE_SIZE / 2, CONST.TILE_SIZE / 2, 90, 0, true, 0)
      direction = 'up'
    } else if (direction === 'down') {
      path.ellipseTo(CONST.TILE_SIZE / 2, CONST.TILE_SIZE / 2, 0, 90, false, 0)
      direction = 'left'
    }
  } else if (nextTile.tile === 'downLeft') {
    if (direction === 'up') {
      path.ellipseTo(CONST.TILE_SIZE / 2, CONST.TILE_SIZE / 2, 0, 270, true, 0)
      direction = 'left'
    } else if (direction === 'right') {
      path.ellipseTo(CONST.TILE_SIZE / 2, CONST.TILE_SIZE / 2, 270, 0, false, 0)
      direction = 'down'
    }
  } else if (nextTile.tile === 'downLeft2x') {
    if (direction === 'up') {
      path.ellipseTo(CONST.TILE_SIZE * 1.5, CONST.TILE_SIZE * 1.5, 0, 270, true, 0)
      direction = 'left'
    } else if (direction === 'right') {
      path.ellipseTo(CONST.TILE_SIZE * 1.5, CONST.TILE_SIZE * 1.5, 270, 0, false, 0)
      direction = 'down'
    }
  } else if (nextTile.tile === 'upRight') {
    if (direction === 'left') {
      path.ellipseTo(CONST.TILE_SIZE / 2, CONST.TILE_SIZE / 2, 90, 180, false, 0)
      direction = 'up'
    } else if (direction === 'down') {
      path.ellipseTo(CONST.TILE_SIZE / 2, CONST.TILE_SIZE / 2, 180, 90, true, 0)
      direction = 'up'
    }
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
