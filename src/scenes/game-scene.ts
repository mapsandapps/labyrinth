import { CONST } from '../helpers/const'
import { DebugGraphics } from '../objects/debug-graphics'
import { Path } from '../objects/path'
import { Player } from '../objects/player'

export class GameScene extends Phaser.Scene {
  private joystickStick
  private joystickStickGraphics
  private joystickPosition
  private joystickStickWellGraphics

  private debugGraphics: DebugGraphics
  private path: Path
  private player: Player
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

    this.player = new Player({
      scene: this
    })

    this.debugGraphics = new DebugGraphics({
      scene: this
    })

    // this.cameras.main.startFollow(this.player)
  }

  update(): void {
    this.player.update(this)
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
