// export class Player extends Phaser.GameObjects.Image {
//   private health: number
//   private speed: number

//   private cursors: Phaser.Input.Keyboard.CursorKeys

//   constructor(params) {
//     super(params.scene, params.x, params.y, params.key, params.frame)

//     this.initImage()
//     this.scene.add.existing(this)
//   }

//   private initImage() {
//     this.health = 1
//     this.speed = 200

//     this.setOrigin(0.5, 0.5)
//     this.setDepth(0)

//     this.cursors = this.scene.input.keyboard.createCursorKeys()
//   }

//   update(): void {
//     if (this.active) {
//       this.handleInput()
//     } else {
//       this.body.setVelocity(0)
//     }
//   }

//   private handleInput() {
//     // if (this.cursors.up.isDown) {
//     //   this.body.setVelocity(0, -this.speed)
//     //   this.angle = 270
//     // }
//   }
// }
