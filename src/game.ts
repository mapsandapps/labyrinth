import 'phaser';
import { GameScene } from './scenes/game-scene';
import { MenuScene } from './scenes/menu-scene';
import { WinScene } from './scenes/win-scene';

let mobileSized: boolean = window.innerWidth < 800

// main game configuration
const config: Phaser.Types.Core.GameConfig = {
  width: mobileSized ? window.innerWidth : 800,
  height: mobileSized ? window.innerHeight : 600,
  type: Phaser.AUTO,
  parent: 'game',
  scene: [MenuScene, GameScene, WinScene],
  input: {
    keyboard: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  },
  render: {
    pixelArt: false,
    antialias: true
  }
};

// game class
export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }

  preload(): void {
    this.scene.start('MenuScene')
  }
}

// when the page is loaded, create our game instance
window.addEventListener('load', () => {
  let game = new Game(config);
});
