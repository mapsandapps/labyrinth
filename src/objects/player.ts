export class Player extends Phaser.GameObjects.PathFollower {
  readonly MAX_DURATION = 5000

  constructor(params) {
    super(params.scene, params.scene.path, 0, 0, 'ball')
    this.init()
    this.scene.add.existing(this)
  }

  private init() {
    this.startFollow({
      from: 0, // not sure why ts thinks these are required
      to: 1,
      duration: this.MAX_DURATION,
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
  }

  update(scene): void {
    scene.path.update(this.pathTween.getValue())
  }
}
