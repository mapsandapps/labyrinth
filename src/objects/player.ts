import { CONST } from '../helpers/const'
import { Path } from '../objects/path'

export class Player extends Phaser.GameObjects.PathFollower {
  private labyrinth: Path
  private pointerDown: boolean = false

  constructor(params) {
    super(params.scene, params.scene.path, 0, 0, 'ball')
    this.init()
    this.scene.add.existing(this)

    this.labyrinth = params.scene.path
  }

  private init() {
    this.startFollow({
      from: 0, // not sure why ts thinks these are required
      to: 1,
      duration: CONST.MAX_DURATION,
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

    const targetPoint = this.labyrinth.getTargetPoint()
    const targetAngle = Phaser.Math.Angle.Between(this.x, this.y, targetPoint.x, targetPoint.y) * 180 / Math.PI

    const angleBetweenPlayerAndCursor = Phaser.Math.Angle.Between(this.x, this.y, pointer.x, pointer.y) * 180 / Math.PI // -180 to 180
    const precision = 180 - Math.abs(Phaser.Math.Angle.ShortestBetween(targetAngle, angleBetweenPlayerAndCursor)) // 0 - 180

    const speedModifier = Math.max(precision - 90, 0) / 90 // 0 - 1
    this.pathTween.setTimeScale(speedModifier)
  }

  private onPointerUp(): void {
    this.pointerDown = false
    this.pathTween.setTimeScale(0)

  }

  update(scene): void {
    scene.path.update(this.pathTween.getValue())
  }
}
