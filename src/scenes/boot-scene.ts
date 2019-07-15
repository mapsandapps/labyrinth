export class BootScene extends Phaser.Scene {
  private loadingBar: Phaser.GameObjects.Graphics
  private progressBar: Phaser.GameObjects.Graphics
  private texts: Phaser.GameObjects.Text[] = []

  constructor() {
    super({
      key: 'BootScene'
    })
  }

  private createLoadingGraphics(): void {
    this.loadingBar = this.add.graphics()
      .fillStyle(0x0a0f25, 1)
      .fillRect(
        this.cameras.main.width / 4 - 2,
        this.cameras.main.height / 2 + 30,
        this.cameras.main.width / 2 + 4,
        20
      )
    this.progressBar = this.add.graphics()
  }

  preload(): void {
    this.cameras.main.setBackgroundColor(0x0db5eb)
    this.createLoadingGraphics()

    this.texts.push(
      this.add.text(
        this.sys.canvas.width / 2,
        this.sys.canvas.height / 2 - 60,
        'LABYRINTH',
        {
          fontSize: '30px'
        }
      ).setOrigin(0.5, 0.5)
    )

    this.load.on(
      'progress',
      value => {
        this.progressBar.clear()
        this.progressBar.fillStyle(0xffffff, 1)
        this.progressBar.fillRect(
          this.cameras.main.width / 4,
          this.cameras.main.height / 2 + 32,
          (this.cameras.main.width / 2) * value,
          16
        )
      }, this
    )

    this.load.on(
      'complete',
      () => {
        this.loadingBar.destroy()
        this.progressBar.destroy()
      },
      this
    )

    this.load.pack('preload', './src/assets/pack.json', 'preload')
  }

  update(): void {
    this.scene.start('GameScene')
  }
}
