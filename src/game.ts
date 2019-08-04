import 'phaser';
import { GameScene } from './scenes/game-scene';
import { BootScene } from './scenes/boot-scene';
import { WinScene } from './scenes/win-scene';

let mobileSized: boolean = window.innerWidth < 800

// main game configuration
const config: Phaser.Types.Core.GameConfig = {
  width: mobileSized ? window.innerWidth : 800,
  height: mobileSized ? window.innerHeight : 600,
  type: Phaser.WEBGL,
  parent: 'game',
  scene: [BootScene, GameScene, WinScene],
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
    this.scene.start('BootScene')
  }
}

// when the page is loaded, create our game instance
window.addEventListener('load', () => {
  new Game(config);
});
