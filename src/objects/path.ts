import { CONST } from '../helpers/const'

interface NavPoint {
  x?: number
  y?: number
  t?: number
}

export class Path extends Phaser.Curves.Path {
  private navPoints: Array<NavPoint>
  private numberOfNavPoints: number
  private targetPoint: NavPoint
  private upcomingPoints: Array<NavPoint>

  constructor() {
    super()

    this.init()
  }

  getNavPoints(): Array<NavPoint> {
    return this.navPoints
  }

  getNumberOfNavPoints(): number {
    return this.numberOfNavPoints
  }

  getUpcomingPoints(): Array<NavPoint> {
    return this.upcomingPoints
  }

  private createNavPoints(): void {
    this.numberOfNavPoints = this.getLength() / CONST.DIST_BW_NAV_POINTS
    this.navPoints = this.getSpacedPoints(this.numberOfNavPoints)

    this.upcomingPoints = this.navPoints.map(point => ({ ...point })) // TODO: replace with lodash cloneDeep

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
    this.moveTo(50, 50)
    this.lineTo(50, 250)
    this.lineTo(150, 250)
    this.lineTo(250, 150)
    this.lineTo(250, 50)
    this.lineTo(150, 50)

    this.createNavPoints()
  }

  update(playerT: number): void {
    if (this.upcomingPoints.length > 0 && playerT >= this.upcomingPoints[0].t) {
      this.upcomingPoints.shift()
    }

    if (this.upcomingPoints.length < 1) {
      // win()
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
