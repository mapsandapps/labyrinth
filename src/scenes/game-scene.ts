import { DebugGraphics } from '../objects/debug-graphics'
import { Lighting } from '../objects/lighting'
import { Path } from '../objects/path'
import { Player } from '../objects/player'

import { CONST } from '../helpers/const'
import { min, sample } from 'lodash'

export class GameScene extends Phaser.Scene {
  private currentLevel: string
  private currentLevelIndex: number = 0
  private map: Phaser.Tilemaps.Tilemap
  private tileset: Phaser.Tilemaps.Tileset
  private won: boolean = false

  private debugGraphics: DebugGraphics
  private path: Path
  private player: Player

  constructor() {
    super({
      key: 'GameScene'
    })
  }

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
    this.won = false
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

    this.add.image(this.game.scale.width / 2, this.game.scale.height / 2, 'texture1')
      .setAlpha(0.05)
      .setBlendMode('ADD')
      .setDepth(-2)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0.1)

    new Lighting(this)

    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBackgroundColor(sample(CONST.BACKGROUND_COLORS))
    this.cameras.main.fadeIn(300)
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

  panAndZoomToShowLevel(): void {
    this.cameras.main.stopFollow()
    let cameraZoomX = this.game.scale.width / this.map.widthInPixels
    let cameraZoomY = this.game.scale.height / this.map.heightInPixels

    this.cameras.main.pan(this.map.heightInPixels / 2, this.map.heightInPixels / 2, 1000)
    this.cameras.main.zoomTo(min([cameraZoomX, cameraZoomY]), 1000, 'Linear')
  }

  win(): void {
    if (this.won) return

    if (this.currentLevelIndex >= CONST.LEVELS.length - 1) {
      this.currentLevelIndex = 0
      this.scene.stop()
      this.scene.get('WinScene').scene.start()
    } else {
      this.panAndZoomToShowLevel()

      // TODO: heart animation or something
      this.time.delayedCall(2000, this.advanceLevel, null, this)
    }
    this.won = true
  }

  advanceLevel(): void {
    this.currentLevelIndex++
    this.scene.stop()
    this.scene.restart()
  }
}
