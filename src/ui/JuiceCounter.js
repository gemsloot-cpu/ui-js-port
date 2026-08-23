/**
 * JuiceCounter - Rolling Numeric Counter with Scale Punch & Text Interpolation
 * Ported from Godot 4 scripts/ui/juice_counter.gd
 */
import Phaser from 'phaser';
import { JuiceConfig } from '../config/JuiceConfig.js';
import { JuiceTween } from '../core/JuiceTween.js';

export class JuiceCounter extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} [initialValue=0]
   * @param {Object} [config]
   */
  constructor(scene, x, y, initialValue = 0, config = {}) {
    super(scene, x, y);

    this.displayValue = initialValue;
    this.targetValue = initialValue;

    this.prefix = config.prefix ?? '';
    this.suffix = config.suffix ?? '';
    this.fontSize = config.fontSize ?? '24px';
    this.color = config.color ?? '#ffffff';
    this.iconKey = config.iconKey ?? null;
    this.commaSeparated = config.commaSeparated ?? true;

    this.initVisuals();

    scene.add.existing(this);
  }

  initVisuals() {
    let textX = 0;
    if (this.iconKey && this.scene.textures.exists(this.iconKey)) {
      this.icon = this.scene.add.image(-20, 0, this.iconKey);
      this.icon.setDisplaySize(24, 24);
      this.add(this.icon);
      textX = 14;
    }

    this.textObj = this.scene.add.text(textX, 0, this.formatNumber(this.displayValue), {
      fontFamily: 'Bungee, sans-serif',
      fontSize: this.fontSize,
      color: this.color,
      stroke: '#111122',
      strokeThickness: 4,
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: '#000000',
        blur: 3,
        fill: true,
        stroke: true
      }
    });
    this.textObj.setOrigin(0.5, 0.5);
    this.add(this.textObj);
  }

  formatNumber(val) {
    const rounded = Math.round(val);
    let str = this.commaSeparated ? rounded.toLocaleString() : String(rounded);
    return `${this.prefix}${str}${this.suffix}`;
  }

  /**
   * Set target value with rolling interpolation
   * @param {number} newValue
   * @param {boolean} [animated=true]
   * @param {number} [duration]
   */
  setValue(newValue, animated = true, duration = JuiceConfig.counter.rollDuration) {
    const prevTarget = this.targetValue;
    this.targetValue = newValue;

    if (!animated) {
      this.displayValue = newValue;
      this.textObj.setText(this.formatNumber(this.displayValue));
      return;
    }

    const delta = Math.abs(newValue - prevTarget);
    if (delta > 0) {
      // Scale punch (proportional to magnitude)
      const punchFactor = Math.min(1.4, 1.15 + (delta > 100 ? 0.15 : 0.05));
      JuiceTween.punchScale(this.scene, this, {
        factor: punchFactor,
        duration: JuiceConfig.counter.punchDuration
      });
    }

    this.scene.tweens.killTweensOf(this, ['displayValue']);
    this.scene.tweens.add({
      targets: this,
      displayValue: newValue,
      duration,
      ease: JuiceConfig.counter.ease,
      onUpdate: () => {
        if (this.textObj) {
          this.textObj.setText(this.formatNumber(this.displayValue));
        }
      },
      onComplete: () => {
        this.displayValue = newValue;
        if (this.textObj) {
          this.textObj.setText(this.formatNumber(this.displayValue));
        }
      }
    });
  }

  /**
   * Add delta to counter
   * @param {number} amount
   */
  add(amount, animated = true) {
    this.setValue(this.targetValue + amount, animated);
  }

  getValue() {
    return this.targetValue;
  }
}

export default JuiceCounter;
