import { Player } from '../objects/player'
// import { Labyrinth } from '../objects/labyrinth'

interface NavPoint {
  x?: number
  y?: number
  t?: number
}

export class GameScene extends Phaser.Scene {
  readonly MAX_DURATION = 5000
  readonly DIST_BW_NAV_POINTS = 30

  private joystickStick
  private joystickStickGraphics
  private joystickPosition
  private joystickStickWellGraphics
  private targetPointGraphics
  private targetPointLine

  private path: Phaser.Curves.Path
  private player: Phaser.GameObjects.PathFollower
  private speedModifier
  private targetPoint
  private trajectory
  private tween
  private upcomingPoints: Array<NavPoint>
  private i = 0


  constructor() {
    super({
      key: "GameScene"
    })
  }

  init(): void { }

  create(): void {
    var pathGraphics = this.add.graphics()
    pathGraphics.lineStyle(32, 0xffffff, 1)

    this.path = new Phaser.Curves.Path(50, 50)
    this.path.lineTo(50, 250)
    this.path.lineTo(150, 250)
    this.path.lineTo(250, 150)
    this.path.lineTo(250, 50)
    this.path.lineTo(150, 50)

    this.path.draw(pathGraphics)

    const numberOfNavPoints = this.path.getLength() / this.DIST_BW_NAV_POINTS

    const navPoints: Array<NavPoint> = this.path.getSpacedPoints(numberOfNavPoints)
    var navPointsGraphics = this.add.graphics({
      fillStyle: {
        color: 0x005500
      }
    })

    for (var i = 0; i < navPoints.length; i++) {
      navPoints[i].t = i / numberOfNavPoints

      // start by removing point 0 from the array
      // the first item in the array is always the next point
      // once your t >= the first point's t, remove that point from the array
      navPointsGraphics.fillCircleShape(new Phaser.Geom.Circle(navPoints[i].x, navPoints[i].y, 1))
    }
    this.upcomingPoints = navPoints.map(point => ({ ...point }))
    if (this.upcomingPoints[this.upcomingPoints.length - 1].t !== 1) {
      this.upcomingPoints.push({
        x: this.path.getEndPoint().x,
        y: this.path.getEndPoint().y,
        t: 1
      })
    }

    this.upcomingPoints.shift() // first point isn't "upcoming"; you're already there

    this.player = this.add.follower(this.path, 50, 50, 'player')
    console.log(this.player)

    this.player.startFollow({
      from: 0, // not sure why ts thinks these are required
      to: 1,
      duration: this.MAX_DURATION,
      rotateToPath: true,
      rotationOffset: 90
    });

    // this.cameras.main.startFollow(this.player)
  }

  update(): void {
    // this.player.update()
  }

  private restartScene(): void {
    this.scene.restart()
  }

  private setObjectsInactive(): void {
    // this.player.setActive(false)
  }

  private exitToWinScene(): void {
    this.setObjectsInactive()
    this.scene.stop()
    this.scene.get('WinScene').scene.start()
  }
}
