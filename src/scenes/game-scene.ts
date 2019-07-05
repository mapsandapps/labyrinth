import { CONST } from '../helpers/const'
import { DebugGraphics } from '../objects/debug-graphics'
import { Path } from '../objects/path'
// import { Player } from '../objects/player'

export class GameScene extends Phaser.Scene {
  private joystickStick
  private joystickStickGraphics
  private joystickPosition
  private joystickStickWellGraphics

  private debugGraphics: DebugGraphics
  private path: Path
  private player: Phaser.GameObjects.PathFollower
  private speedModifier
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

    this.player = this.add.follower(this.path, 0, 0, 'ball')

    this.player.startFollow({
      from: 0, // not sure why ts thinks these are required
      to: 1,
      duration: CONST.MAX_DURATION,
      // rotateToPath: true,
      rotationOffset: 90
    })

    this.anims.create({
      key: 'roll',
      frames: this.anims.generateFrameNumbers('ball', { frames: [0, 1, 2, 3, 4] }),
      frameRate: 1,
      repeat: -1
    })
    this.player.anims.play('roll', true)

    this.debugGraphics = new DebugGraphics({
      scene: this
    })

    // this.cameras.main.startFollow(this.player)
  }

  update(): void {
    // this.player.update()
    this.path.update(this.player.pathTween.getValue())

    this.debugGraphics.update(this)
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
