import { CONST } from '../helpers/const'
import { Path } from '../objects/path'
// import { Player } from '../objects/player'

export class GameScene extends Phaser.Scene {
  private joystickStick
  private joystickStickGraphics
  private joystickPosition
  private joystickStickWellGraphics
  private targetPointGraphics: Phaser.GameObjects.Graphics

  private path: Path
  private player: Phaser.GameObjects.PathFollower
  private speedModifier
  private targetPointLine: Phaser.Geom.Line
  private trajectory
  private tween

  constructor() {
    super({
      key: "GameScene"
    })
  }

  init(): void { }

  create(): void {
    var pathGraphics = this.add.graphics()
    pathGraphics.lineStyle(32, 0xffffff, 1)

    this.path = new Path()
    this.path.draw(pathGraphics)

    var navPointsGraphics = this.add.graphics({
      fillStyle: {
        color: 0x005500
      }
    })

    const navPoints = this.path.getNavPoints()
    for (var i = 0; i < navPoints.length; i++) {
      navPointsGraphics.fillCircleShape(new Phaser.Geom.Circle(navPoints[i].x, navPoints[i].y, 1))
    }

    this.player = this.add.follower(this.path, 0, 0, 'player')

    this.player.startFollow({
      from: 0, // not sure why ts thinks these are required
      to: 1,
      duration: CONST.MAX_DURATION,
      rotateToPath: true,
      rotationOffset: 90
    })

    this.targetPointGraphics = this.add.graphics({
      lineStyle: {
        color: 0x009900,
        width: 4
      }
    })

    this.targetPointLine = new Phaser.Geom.Line()

    // this.cameras.main.startFollow(this.player)
  }

  update(): void {
    // this.player.update()
    this.path.update(this.player.pathTween.getValue())

    this.targetPointLine.setTo(this.player.x, this.player.y, this.path.getTargetPoint().x, this.path.getTargetPoint().y)
    this.targetPointGraphics.clear()
    this.targetPointGraphics.strokeLineShape(this.targetPointLine)
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
