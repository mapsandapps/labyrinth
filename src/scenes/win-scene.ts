export class WinScene extends Phaser.Scene {
  private readyToStart: boolean = false
  private texts: Phaser.GameObjects.Text[] = []

  constructor() {
    super({
      key: 'WinScene'
    })
  }

  pointerDown(): void {
    this.readyToStart = true
  }

  pointerUp(): void {
    // usually the pointer will already be down when the last level ends... we don't want to trigger the reset when they bring it up. instead, wait until they've tapped down on this screen
    if (this.readyToStart) {
      this.scene.start('GameScene')
    }
  }


  init(): void {
    this.input.on('pointerdown', () => this.pointerDown())
    this.input.on('pointerup', () => this.pointerUp())
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0db5eb)

    this.texts.push(
      this.add.text(
        this.sys.canvas.width / 2,
        this.sys.canvas.height / 2 - 40,
        'You won!', {
          align: 'center',
          fontSize: '22px'
        }
      ).setOrigin(0.5, 0.5)
    )

    this.texts.push(
      this.add.text(
        this.sys.canvas.width / 2,
        this.sys.canvas.height / 2 + 40,
        'Tap to restart.', {
          align: 'center'
        }
      ).setOrigin(0.5, 0.5)
    )
  }
}
