import { DebugGraphics } from '../objects/debug-graphics'
import { Lighting } from '../objects/lighting'
import { Path } from '../objects/path'
import { Player } from '../objects/player'

import { CONST } from '../helpers/const'
import { sample } from 'lodash'

export class GameScene extends Phaser.Scene {
  private currentLevel: string
  private currentLevelIndex: number = 0
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
      key: `map${this.currentLevel}`
    })
    this.tileset = this.map.addTilesetImage('temp-tiles', 'tiles', 64, 64, 1, 2) // 1st string is name in Tiled; 2nd is key in pack.json
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
    this.currentLevel = CONST.LEVELS[this.currentLevelIndex]
    this.createTilemap()

    let pathGraphics = this.add.graphics()
    pathGraphics.lineStyle(3, 0xffffff, 5)

    let directionsData = this.cache.json.get(`directions${this.currentLevel}`)
    this.path = new Path(this, directionsData.directions)

    this.player = new Player({
      scene: this,
      changeDepthAt: directionsData.changeDepthAt
    })

    if (CONST.DEBUG.GRAPHICS_ON) {
      this.debugGraphics = new DebugGraphics({
        scene: this,
        path: this.path
      })
    }

    new Lighting(this)

    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBackgroundColor(sample(CONST.BACKGROUND_COLORS))
  }

  update(): void {
    this.path.update()
    if (CONST.DEBUG.GRAPHICS_ON) {
      this.debugGraphics.update(this)
    }
    this.player.update()
  }

  getPlayerT(): number {
    return this.player.pathTween.getValue()
  }

  win(): void {
    // this.player.setActive(false)
    // this.scene.pause()
    this.scene.stop()
    if (this.currentLevelIndex >= CONST.LEVELS.length - 1) {
      this.scene.get('WinScene').scene.start()
    } else {
      this.currentLevelIndex++
      this.scene.restart()
    }
  }
}
