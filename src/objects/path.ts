import { cloneDeep } from 'lodash'

import { CONST } from '../helpers/const'
import { GameScene } from '../scenes/game-scene'

interface NavPoint {
  x?: number
  y?: number
  t?: number
}

export class Path extends Phaser.Curves.Path {
  private navPoints: Array<NavPoint>
  private numberOfNavPoints: number
  private scene: GameScene
  private targetPoint: NavPoint
  private upcomingPoints: Array<NavPoint>

  constructor(scene) {
    super()

    this.scene = scene

    this.init()
  }

  getNavPoints(): Array<NavPoint> {
    return this.navPoints
  }

  private getNumberOfNavPoints(): number {
    return this.numberOfNavPoints
  }

  getTargetPoint(): NavPoint {
    return this.targetPoint
  }

  getUpcomingPoints(): Array<NavPoint> {
    return this.upcomingPoints
  }

  private createNavPoints(): void {
    // start by removing point 0 from the array
    // the first item in the array is always the next point
    // once your t >= the first point's t, remove that point from the array

    this.numberOfNavPoints = this.getLength() / CONST.DIST_BW_NAV_POINTS
    this.navPoints = this.getSpacedPoints(this.numberOfNavPoints)

    for (var i = 0; i < this.navPoints.length; i++) {
      this.navPoints[i].t = i / this.getNumberOfNavPoints()
    }

    this.upcomingPoints = cloneDeep(this.navPoints)

    if (this.upcomingPoints[this.upcomingPoints.length - 1].t !== 1) {
      this.upcomingPoints.push({
        x: this.getEndPoint().x,
        y: this.getEndPoint().y,
        t: 1
      })
    }

    this.upcomingPoints.shift() // first point isn't "upcoming"; you're already there
  }

  private init(): void {
    let map = [
      { x: 2, y: 8 },
      { x: 2, y: 6 },
      { x: 4, y: 6 },
      { x: 4, y: 4 },
      { x: 2, y: 4 },
      { x: 2, y: 2 },
      { x: 5, y: 2 },
      { x: 6, y: 3 },
      { x: 6, y: 8 },
      { x: 3, y: 8 },
      { x: 3, y: 5 },
      { x: 8, y: 5 },
      { x: 8, y: 7 },
      { x: 5, y: 7 },
      { x: 5, y: 3 },
      { x: 4, y: 3 }
    ]
    map.forEach((coord, i) => {
      if (i === 0) {
        this.moveTo(coord.x * 64 - 32, coord.y * 64 - 32)
      } else {
        this.lineTo(coord.x * 64 - 32, coord.y * 64 - 32)
      }
    })

    this.createNavPoints()
  }

  update(): void {
    const playerT = this.scene.getPlayerT()
    if (this.upcomingPoints.length > 0 && playerT >= this.upcomingPoints[0].t) {
      this.upcomingPoints.shift()
    }

    if (this.upcomingPoints.length < 1) {
      this.scene.win()
      return
    } else if (this.upcomingPoints.length < 3) {
      // if we do halfway between two for the next to last one, it's very close to the last one, so just skip one
      if (this.upcomingPoints.length === 2) {
        this.upcomingPoints.shift()
      }
      this.targetPoint = {
        x: this.upcomingPoints[0].x,
        y: this.upcomingPoints[0].y
      }
    } else {
      this.targetPoint = {
        x: (this.upcomingPoints[0].x + this.upcomingPoints[1].x) / 2,
        y: (this.upcomingPoints[0].y + this.upcomingPoints[1].y) / 2
      }
    }
  }
}
