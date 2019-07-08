import { CONST } from '../helpers/const'
import { Path } from '../objects/path'

interface DepthChange {
  t: number,
  depth: number
}

export class Player extends Phaser.GameObjects.PathFollower {
  private changeDepthAt: Array<DepthChange>
  private labyrinth: Path
  private pointerDown: boolean = false

  constructor(params) {
    super(params.scene, params.scene.path, 0, 0, 'ball')
    this.changeDepthAt = params.changeDepthAt
    this.init()
    this.scene.add.existing(this)

    this.labyrinth = params.scene.path
  }

  private init() {
    this.setDepth(1)

    this.startFollow({
      from: 0, // not sure why ts thinks these are required
      to: 1,
      duration: 200000 / CONST.MAX_SPEED,
      // rotateToPath: true,
      rotationOffset: 90
    });

    this.scene.anims.create({
      key: 'roll',
      frames: this.scene.anims.generateFrameNumbers('ball', { frames: [0, 1, 2, 3, 4] }),
      frameRate: 1,
      repeat: -1
    })
    this.anims.play('roll', true)

    this.scene.input.on('pointermove', this.onPointerMove, this)
    this.scene.input.on('pointerdown', this.onPointerDown, this)
    this.scene.input.on('pointerup', this.onPointerUp, this)
    // FIXME: need to reuse onPointerUp event handlers for more events (e.g. pointer leaves the view)

    this.pathTween.setTimeScale(0)
  }

  private onPointerDown(): void {
    this.pointerDown = true
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.pointerDown) return

    if (this.changeDepthAt.length > 0 && this.pathTween.getValue() >= this.changeDepthAt[0].t) {
      this.setDepth(this.changeDepthAt[0].depth)
      this.changeDepthAt.shift()
    }

    const targetPoint = this.labyrinth.getTargetPoint()
    const targetAngle = Phaser.Math.Angle.Between(this.x, this.y, targetPoint.x, targetPoint.y) * 180 / Math.PI

    const angleBetweenPlayerAndCursor = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY) * 180 / Math.PI // -180 to 180
    const precision = 180 - Math.abs(Phaser.Math.Angle.ShortestBetween(targetAngle, angleBetweenPlayerAndCursor)) // 0 - 180

    const speedModifier = Math.max(precision - 90, 0) / 90 // 0 - 1
    this.pathTween.setTimeScale(speedModifier)
  }

  private onPointerUp(): void {
    this.pointerDown = false
    this.pathTween.setTimeScale(0)
  }
}
