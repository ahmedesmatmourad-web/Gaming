import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { MainScene } from '../scenes/MainScene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  backgroundColor: '#c9924a',
  parent: 'game',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MainScene]
};
