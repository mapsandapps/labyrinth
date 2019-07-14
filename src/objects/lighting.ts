export class Lighting extends Phaser.GameObjects.Particles.ParticleEmitterManager {

  constructor(scene) {
    super(scene, 'light-particle')

    this.init(scene)
  }

  init(scene): void {
    let lightArea = new Phaser.Geom.Rectangle(
      -scene.game.config.width / 2,
      -scene.game.config.height / 2,
      scene.game.config.width + scene.map.widthInPixels,
      scene.game.config.height + scene.map.heightInPixels
    )

    this.createEmitter({
      x: 0,
      y: 0,
      alpha: {
        start: 1,
        end: 0,
        ease: 'Quad.easeIn'
      },
      blendMode: 'ADD',
      emitZone: {
        type: 'random',
        source: lightArea
      },
      frequency: 200,
      gravityY: 0,
      lifespan: 5000,
      scale: {
        start: 0,
        end: 0.2,
        ease: 'Quad.easeOut'
      }
    })

    // splat out some lights to start with
    this.emitParticle(5)

    this.setDepth(-1)

    scene.add.existing(this)
  }
}
