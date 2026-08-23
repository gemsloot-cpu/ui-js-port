/**
 * JuiceTooltip - Floating Tooltip Container
 * Ported from Godot 4 scripts/ui/juice_tooltip.gd
 */
import Phaser from 'phaser';
import { JuicePalette } from './JuicePalette.js';

export class JuiceTooltip extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    super(scene, 0, 0);

    this.padding = 10;
    this.setDepth(3000);
    this.setScrollFactor(0);
    this.setVisible(false);
    this.setAlpha(0);

    this.bg = scene.add.graphics();
    this.add(this.bg);

    this.text = scene.add.text(0, 0, '', {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.add(this.text);

    scene.add.existing(this);
  }

  show(x, y, message) {
    this.text.setText(message);
    const bounds = this.text.getBounds();
    const w = bounds.width + this.padding * 2;
    const h = bounds.height + this.padding * 2;

    this.bg.clear();
    this.bg.fillStyle(JuicePalette.surface, 0.95);
    this.bg.fillRoundedRect(0, 0, w, h, 6);
    this.bg.lineStyle(1.5, JuicePalette.accent, 0.8);
    this.bg.strokeRoundedRect(0, 0, w, h, 6);

    this.text.setPosition(this.padding, this.padding);

    // Adjust position to stay on screen
    const { width: screenW, height: screenH } = this.scene.scale;
    let targetX = x + 15;
    let targetY = y + 15;

    if (targetX + w > screenW - 10) targetX = x - w - 10;
    if (targetY + h > screenH - 10) targetY = y - h - 10;

    this.setPosition(targetX, targetY);
    this.setVisible(true);

    this.scene.tweens.killTweensOf(this);
    this.setScale(0.85);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 150,
      ease: 'Back.easeOut'
    });
  }

  hide() {
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.85,
      scaleY: 0.85,
      duration: 120,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.setVisible(false);
      }
    });
  }
}

export default JuiceTooltip;
