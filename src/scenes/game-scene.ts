import { DebugGraphics } from '../objects/debug-graphics'
import { Path } from '../objects/path'
import { Player } from '../objects/player'

export class GameScene extends Phaser.Scene {
  private map: Phaser.Tilemaps.Tilemap
  private tileset: Phaser.Tilemaps.Tileset

  private debugGraphics: DebugGraphics
  private path: Path
  private player: Player

  constructor() {
    super({
      key: "GameScene"
    })
  }

  init(): void { }

  createTilemap(): void {
    this.map = this.make.tilemap({
      key: 'map1'
    })
    this.tileset = this.map.addTilesetImage('tiles')
    this.map.layers.forEach(layer => {
      this.map.createStaticLayer(
        layer.name,
        this.tileset,
        0,
        0
      ).setDepth(parseInt(layer.name))
    })
  }

  create(): void {
    this.createTilemap()

    let pathGraphics = this.add.graphics()
    pathGraphics.lineStyle(3, 0xffffff, 1)

    let pathData = this.cache.json.get('path1')
    this.path = new Path(this, pathData.directions)
    // this.path.draw(pathGraphics)

    this.player = new Player({
      scene: this,
      changeDepthAt: pathData.changeDepthAt
    })

    this.debugGraphics = new DebugGraphics({
      scene: this
    })

    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBackgroundColor('#0db5eb')
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
