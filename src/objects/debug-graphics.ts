import { round } from 'lodash'

export class DebugGraphics extends Phaser.GameObjects.Group {
  private info: Phaser.GameObjects.Text
  private targetPointGraphics: Phaser.GameObjects.Graphics
  private targetPointLine: Phaser.Geom.Line

  constructor(params) {
    super(params.scene, params)

    this.init(params.scene)
  }

  private init(scene): void {
    var navPointsGraphics = new Phaser.GameObjects.Graphics(scene, {
      fillStyle: {
        color: 0x480a3e
      }
    })
    navPointsGraphics.setDepth(101)

    const navPoints = scene.path.getNavPoints()
    for (var i = 0; i < navPoints.length; i++) {
      navPointsGraphics.fillCircleShape(new Phaser.Geom.Circle(navPoints[i].x, navPoints[i].y, 1))
    }

    this.targetPointGraphics = new Phaser.GameObjects.Graphics(scene, {
      lineStyle: {
        color: 0x00cc00,
        width: 4
      }
    })
    this.targetPointGraphics.setDepth(102)

    this.targetPointLine = new Phaser.Geom.Line()

    scene.add.existing(navPointsGraphics) // TODO: i really want to add navPointGraphics to this group and then add the group to the scene
    scene.add.existing(this.targetPointGraphics)

    let pathGraphics = new Phaser.GameObjects.Graphics(scene, {
      lineStyle: {
        color: 0xf07300,
        width: 3,
        alpha: 0.3
      }
    })

    pathGraphics.setDepth(100)
    scene.path.draw(pathGraphics)
    scene.add.existing(pathGraphics)

    this.info = new Phaser.GameObjects.Text(scene, scene.sys.canvas.width - 10, 10, '', {
      font: '12px Arial',
      fill: '#ffffff'
    }).setOrigin(1, 0).setScrollFactor(0)

    scene.add.existing(this.info)
  }

  update(scene): void {
    this.targetPointLine.setTo(scene.player.x, scene.player.y, scene.path.getTargetPoint().x, scene.path.getTargetPoint().y)
    this.targetPointGraphics.clear()
    this.targetPointGraphics.strokeLineShape(this.targetPointLine)

    this.info.setText(`Player T: ${round(scene.player.pathTween.getValue(), 2)}`)
  }
}
