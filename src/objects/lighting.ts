import { Light } from './light'

import { random } from 'lodash'

export class Lighting extends Phaser.GameObjects.Group {
  private lights: Array<Light> = []

  constructor(scene) {
    super(scene)

    this.init(scene)
  }

  replaceLight(index): void {
    let light: Light = this.lights[index]
    light.setX(random(-this.scene.game.scale.width * 0.2, this.scene.game.scale.width * 1.2))
    light.setY(random(-this.scene.game.scale.height * 0.2, this.scene.game.scale.height * 1.2))

    light.restart(this.scene)
  }

  init(scene): void {
    for (let i = 0; i < 10; i++) {
      let lightX = random(-scene.game.scale.width * 0.2, scene.game.scale.width * 1.2)
      let lightY = random(-scene.game.scale.height * 0.2, scene.game.scale.height * 1.2)
      this.lights.push(new Light(scene, this, i, lightX, lightY))
    }
  }
}
