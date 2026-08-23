/**
 * DamageNumbers - Floating Animated Combat Text Spawner
 * Ported from Godot 4 scripts/core/damage_numbers.gd
 */
import Phaser from 'phaser';
import { JuiceConfig } from '../config/JuiceConfig.js';

export class DamageNumbers {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(1000);
  }

  /**
   * Spawn a floating damage / heal number
   * @param {number} x - World X position
   * @param {number} y - World Y position
   * @param {number|string} amount - Value to display
   * @param {Object} [options]
   */
  spawn(x, y, amount, options = {}) {
    const isCrit = options.isCrit ?? false;
    const isHeal = options.isHeal ?? false;
    const isShield = options.isShield ?? false;
    const config = JuiceConfig.damageNumbers;

    let textStr = String(amount);
    if (isHeal && !textStr.startsWith('+')) {
      textStr = `+${textStr}`;
    }

    let textColor = config.colors.normal;
    let fontSize = config.fontSizeNormal;
    let initialScale = config.normalScale;

    if (isCrit) {
      textColor = config.colors.crit;
      fontSize = config.fontSizeCrit;
      initialScale = config.critScale;
      textStr = `★ ${textStr} !`;
    } else if (isHeal) {
      textColor = config.colors.heal;
      fontSize = config.fontSizeHeal;
      initialScale = config.healScale;
    } else if (isShield) {
      textColor = config.colors.shield;
      fontSize = config.fontSizeNormal;
      initialScale = config.shieldScale;
    }

    const text = this.scene.add.text(0, 0, textStr, {
      fontFamily: 'Bungee, sans-serif',
      fontSize,
      color: textColor,
      stroke: config.colors.outline,
      strokeThickness: isCrit ? 6 : 4,
      shadow: {
        offsetX: 0,
        offsetY: 3,
        color: '#000000',
        blur: 4,
        stroke: true,
        fill: true
      }
    });
    text.setOrigin(0.5, 0.5);

    // Random initial trajectory
    const randOffsetRangeX = isCrit ? 20 : 12;
    const spawnX = x + Phaser.Math.Between(-randOffsetRangeX, randOffsetRangeX);
    const spawnY = y + Phaser.Math.Between(-10, 10);

    const numContainer = this.scene.add.container(spawnX, spawnY, [text]);
    this.container.add(numContainer);

    numContainer.setScale(initialScale * 1.6);

    const velX = Phaser.Math.Between(config.velXMin, config.velXMax);
    const velY = Phaser.Math.Between(config.velYMin, config.velYMax);
    const duration = options.duration ?? config.duration;
    const durationSec = duration / 1000.0;

    // Scale pop tween
    this.scene.tweens.add({
      targets: numContainer,
      scaleX: initialScale,
      scaleY: initialScale,
      duration: 180,
      ease: 'Back.easeOut'
    });

    // Arc movement tween
    const targetX = spawnX + velX * durationSec * 0.8;
    const peakY = spawnY + velY * 0.28;
    const finalY = peakY + config.gravity * 0.5 * (durationSec * 0.7) ** 2;

    this.scene.tweens.add({
      targets: numContainer,
      x: targetX,
      duration: duration,
      ease: 'Linear'
    });

    this.scene.tweens.add({
      targets: numContainer,
      y: peakY,
      duration: duration * 0.4,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (!numContainer || !numContainer.scene) return;
        this.scene.tweens.add({
          targets: numContainer,
          y: finalY,
          duration: duration * 0.6,
          ease: 'Quad.easeIn'
        });
      }
    });

    // Fade out and cleanup
    this.scene.tweens.add({
      targets: numContainer,
      alpha: 0,
      delay: config.fadeDelay,
      duration: duration - config.fadeDelay,
      ease: 'Quad.easeIn',
      onComplete: () => {
        numContainer.destroy();
      }
    });

    return numContainer;
  }

  destroy() {
    if (this.container) {
      this.container.destroy();
    }
  }
}

export default DamageNumbers;
