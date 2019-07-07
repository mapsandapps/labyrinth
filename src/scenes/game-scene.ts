import { DebugGraphics } from '../objects/debug-graphics'
import { Path } from '../objects/path'
import { Player } from '../objects/player'

export class GameScene extends Phaser.Scene {
  private debugGraphics: DebugGraphics
  private path: Path
  private player: Player

  constructor() {
    super({
      key: "GameScene"
    })
  }

  init(): void { }

  create(): void {
    var pathGraphics = this.add.graphics()
    pathGraphics.lineStyle(32, 0xffffff, 1)

    this.path = new Path(this)
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
    this.path.update()
    this.debugGraphics.update(this)
  }

  getPlayerT(): number {
    return this.player.pathTween.getValue()
  }

  win(): void {
    // this.player.setActive(false)
    // this.scene.pause()
    this.scene.stop()
    this.scene.get('WinScene').scene.start()
    // this.restartScene()
  }

  private restartScene(): void {
    this.scene.restart()
  }
}
