/**
 * Main Entry Point for Phaser 3 Game Application
 * Gemsloot CPU UI & Juice Library Ported to Phaser 3
 */
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { DemoScene } from './scenes/DemoScene.js';
import { HitFlashPipeline } from './shaders/HitFlashPipeline.js';
import { CrtPostFXPipeline } from './shaders/CrtPostFXPipeline.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: '#0f0f1b',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  pipeline: {
    HitFlashPipeline,
    CrtPostFXPipeline
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  audio: {
    disableWebAudio: false
  },
  scene: [BootScene, DemoScene]
};

const game = new Phaser.Game(config);

export default game;
