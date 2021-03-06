import { CONST } from '../helpers/const'
import { Path } from '../objects/path'

interface DepthChange {
  t: number
  depth: number
}

export class Player extends Phaser.GameObjects.PathFollower {
  private changeDepthAt: Array<DepthChange>
  private emitter: Phaser.GameObjects.Particles.ParticleEmitter
  private labyrinth: Path
  private particles: Phaser.GameObjects.Particles.ParticleEmitterManager
  private pointerDown: boolean = false
  private previousSpeed: number = 0

  constructor(params) {
    super(params.scene, params.scene.path, 0, 0, CONST.DEBUG.PLAYER ? 'debug-player' : 'ball')
    this.changeDepthAt = params.changeDepthAt
    this.labyrinth = params.scene.path
    this.init()
    this.scene.add.existing(this)
  }

  private init() {
    this.setDepth(1)

    this.startFollow({
      duration: this.labyrinth.getLength() * 2,
      rotateToPath: true,
      rotationOffset: 180
    });

    if (!CONST.DEBUG.PLAYER) {
      this.scene.anims.create({
        key: 'roll',
        frames: this.scene.anims.generateFrameNumbers('ball', {
          frames: [0, 1, 2, 3, 4, 5]
        }),
        frameRate: 18,
        repeat: -1
      })
      this.scene.anims.create({
        key: 'idle',
        frames: this.scene.anims.generateFrameNumbers('idle', {
          frames: [0, 1, 2, 3, 4, 5]
        }),
        frameRate: 6,
        repeat: -1
      })
      this.anims.play('roll', true)
    }

    this.particles = new Phaser.GameObjects.Particles.ParticleEmitterManager(this.scene, 'star')

    this.emitter = this.particles.createEmitter({
      blendMode: 'ADD',
      lifespan: 300,
      scale: {
        start: 0.4,
        end: 0.0
      },
      tint: 0xb38b3f
    })

    this.particles.setDepth(1)
    this.emitter.startFollow(this)

    this.scene.add.existing(this.particles)

    this.scene.input.on('pointermove', this.onPointerMove, this)
    this.scene.input.on('pointerdown', this.onPointerDown, this)
    this.scene.input.on('pointerup', this.onPointerUp, this)
    // FIXME: need to reuse onPointerUp event handlers for more events (e.g. pointer leaves the view)

    if (!CONST.DEBUG.AUTO_PLAY_ON) {
      this.setSpeed(0)
    }
  }

  private setSpeed(speed: number): void {
    if (speed) {
      if (this.previousSpeed === 0 && !CONST.DEBUG.PLAYER) {
        this.anims.play('roll')
      }
      // this.anims.msPerFrame = (1 - speed) * 200 + 50
      this.emitter.start()
      this.emitter.setSpeed(speed * 200)
      this.previousSpeed = speed
    } else {
      // this.anims.msPerFrame = 1000
      if (!CONST.DEBUG.PLAYER) this.anims.play('idle')
      this.emitter.stop()
      this.previousSpeed = 0
    }
    this.pathTween.setTimeScale(speed)
  }

  private onPointerDown(): void {
    this.pointerDown = true
  }

  update(): void {
    if (this.changeDepthAt.length > 0 && this.pathTween.getValue() >= this.changeDepthAt[0].t) {
      this.setDepth(this.changeDepthAt[0].depth)
      this.particles.setDepth(this.changeDepthAt[0].depth)
      this.changeDepthAt.shift()
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.pointerDown) return

    const targetPoint = this.labyrinth.getTargetPoint()
    const targetAngle = Phaser.Math.Angle.Between(this.x, this.y, targetPoint.x, targetPoint.y) * 180 / Math.PI

    const angleBetweenPlayerAndCursor = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY) * 180 / Math.PI // -180 to 180

    const precision = 180 - Math.abs(Phaser.Math.Angle.ShortestBetween(targetAngle, angleBetweenPlayerAndCursor)) // 0 - 180
    const speedModifier = Math.max(precision - 90, 0) / 90 // 0 - 1
    this.setSpeed(speedModifier)
  }

  private onPointerUp(): void {
    this.pointerDown = false
    this.setSpeed(0)
  }
}
