export class DebugGraphics extends Phaser.GameObjects.Group {
  private targetPointGraphics: Phaser.GameObjects.Graphics
  private targetPointLine: Phaser.Geom.Line

  constructor(params) {
    super(params.scene, params)

    this.init(params.scene)
  }

  preload(): void { }

  private init(scene): void {
    var navPointsGraphics = new Phaser.GameObjects.Graphics(scene, {
      fillStyle: {
        color: 0x005500
      }
    })

    const navPoints = scene.path.getNavPoints()
    for (var i = 0; i < navPoints.length; i++) {
      navPointsGraphics.fillCircleShape(new Phaser.Geom.Circle(navPoints[i].x, navPoints[i].y, 1))
    }

    this.targetPointGraphics = new Phaser.GameObjects.Graphics(scene, {
      lineStyle: {
        color: 0x009900,
        width: 4
      }
    })

    this.targetPointLine = new Phaser.Geom.Line()

    scene.add.existing(navPointsGraphics) // TODO: i really want to add navPointGraphics to this group and then add the group to the scene
    scene.add.existing(this.targetPointGraphics)
  }

  create(): void { }

  update(scene): void {
    this.targetPointLine.setTo(scene.player.x, scene.player.y, scene.path.getTargetPoint().x, scene.path.getTargetPoint().y)
    this.targetPointGraphics.clear()
    this.targetPointGraphics.strokeLineShape(this.targetPointLine)
  }
}
