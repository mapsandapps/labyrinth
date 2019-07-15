import { Lighting } from './lighting'

import { random } from 'lodash'

export class Light extends Phaser.GameObjects.Image {
  private index: number
  private lighting: Lighting

  constructor(scene, lighting, index, x, y) {
    super(scene, x, y, 'light-particle')

    this.init(scene)
    this.lighting = lighting
    this.index = index
    this.scene.add.existing(this)
  }

  onCompleteHandler(): void {
    this.lighting.replaceLight(this.index)
  }

  restart(scene): void {
    scene.tweens.add({
      targets: this,
      alpha: random(0.5, 1),
      duration: random(1000, 5000),
      ease: 'Power1',
      repeat: random(0, 4),
      yoyo: true,
      onComplete: this.onCompleteHandler.bind(this)
    })
  }

  init(scene): void {
    this.setBlendMode('ADD')
    this.setDepth(-1)
    this.setScrollFactor(0.1)
    this.setScale(random(0.1, 0.3))
    this.setAlpha(0)

    this.restart(scene)
  }
}
