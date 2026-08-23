/**
 * BootScene - Asset Preloader & Bootloader with Custom Loading Screen
 */
import Phaser from 'phaser';
import { SfxLibrary } from '../config/SfxLibrary.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const { width, height } = this.scale;

    // Background styling
    this.cameras.main.setBackgroundColor('#0f0f1b');

    // Loading Screen UI
    const title = this.add.text(width / 2, height / 2 - 60, 'GEMSLOOT JUICE UI', {
      fontFamily: 'Bungee, sans-serif',
      fontSize: '28px',
      color: '#e94560',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5, 0.5);

    const subTitle = this.add.text(width / 2, height / 2 - 25, 'Loading Assets & Audio Banks...', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#a4b0be'
    });
    subTitle.setOrigin(0.5, 0.5);

    // Progress Bar Track
    const barWidth = 360;
    const barHeight = 20;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2 + 20;

    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x1a1a2e, 1.0);
    progressBox.fillRoundedRect(barX, barY, barWidth, barHeight, 6);
    progressBox.lineStyle(2, 0x3d3d5c, 1.0);
    progressBox.strokeRoundedRect(barX, barY, barWidth, barHeight, 6);

    const progressBar = this.add.graphics();

    const percentText = this.add.text(width / 2, barY + 36, '0%', {
      fontFamily: 'Bungee, sans-serif',
      fontSize: '14px',
      color: '#f7b731'
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xe94560, 1.0);
      const fillW = Math.max(0, (barWidth - 4) * value);
      if (fillW > 0) {
        progressBar.fillRoundedRect(barX + 2, barY + 2, fillW, barHeight - 4, 4);
      }
      percentText.setText(`${Math.floor(value * 100)}%`);
    });

    // 1. Textures
    const textureList = [
      'circle_hard', 'circle_outline', 'circle_soft', 'diamond',
      'glow_tight', 'glow_wide', 'gradient_v', 'hexagon',
      'icon_discord', 'icon_github', 'icon_instagram',
      'noise', 'pixel', 'ring', 'ring_thin', 'scanlines',
      'shard', 'spark', 'spark_long', 'square', 'square_outline',
      'star', 'streak', 'triangle'
    ];

    for (const tex of textureList) {
      this.load.image(tex, `assets/textures/${tex}.png`);
    }

    // 2. Audio SFX Banks
    for (const [bankName, bankData] of Object.entries(SfxLibrary.banks)) {
      for (const filePath of bankData.files) {
        const parts = filePath.split('/');
        const filename = parts[parts.length - 1].replace('.ogg', '');
        const audioKey = `sfx_${filename}`;
        this.load.audio(audioKey, `assets/${filePath}`);
      }
    }
  }

  create() {
    // Transition to Demo Scene
    this.cameras.main.fade(200, 15, 15, 27, false, (camera, progress) => {
      if (progress === 1) {
        this.scene.start('DemoScene');
      }
    });
  }
}

export default BootScene;
