import { CONST } from '../helpers/const'

export class Path extends Phaser.Curves.Path {

  constructor() {
    super()

    this.init()
  }

  // TODO: this will be able to be a private readonly once navpoints stuff gets moved in here
  numberOfNavPoints(): number {
    return this.getLength() / CONST.DIST_BW_NAV_POINTS
  }

  private init(): void {
    this.moveTo(50, 50)
    this.lineTo(50, 250)
    this.lineTo(150, 250)
    this.lineTo(250, 150)
    this.lineTo(250, 50)
    this.lineTo(150, 50)
  }
}
