/**
 * JuiceBackdrop - Fullscreen Dimmed Modal Backdrop
 * Ported from Godot 4 scripts/ui/juice_backdrop.gd
 */
import Phaser from 'phaser';
import { JuicePalette } from './JuicePalette.js';

export class JuiceBackdrop extends Phaser.GameObjects.Rectangle {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} [config]
   */
  constructor(scene, config = {}) {
    const { width, height } = scene.scale;
    const color = config.color ?? 0x000000;
    const targetAlpha = config.alpha ?? 0.72;

    super(scene, width / 2, height / 2, width * 2, height * 2, color, 0);

    this.targetAlpha = targetAlpha;
    this.onClick = config.onClick ?? null;
    this.closeOnClick = config.closeOnClick ?? true;

    this.setScrollFactor(0);
    this.setDepth(config.depth ?? 1500);
    this.setVisible(false);

    this.setInteractive();
    this.on('pointerdown', (pointer) => {
      if (this.onClick) {
        this.onClick(pointer);
      }
    });

    // Resize handler
    scene.scale.on('resize', (gameSize) => {
      this.setPosition(gameSize.width / 2, gameSize.height / 2);
      this.setSize(gameSize.width * 2, gameSize.height * 2);
    });

    scene.add.existing(this);
  }

  /**
   * Fade in the backdrop
   * @param {number} [duration=250]
   * @param {Function} [onComplete]
   */
  fadeIn(duration = 250, onComplete = null) {
    this.setVisible(true);
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      fillAlpha: this.targetAlpha,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });
  }

  /**
   * Fade out the backdrop
   * @param {number} [duration=200]
   * @param {Function} [onComplete]
   */
  fadeOut(duration = 200, onComplete = null) {
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      fillAlpha: 0,
      duration,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.setVisible(false);
        if (onComplete) onComplete();
      }
    });
  }
}

export default JuiceBackdrop;
