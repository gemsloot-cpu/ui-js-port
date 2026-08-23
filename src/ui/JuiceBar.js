/**
 * JuiceBar - Dual-Fill Progress / Health / Mana Bar with Trailing Ghost Bar
 * Ported from Godot 4 scripts/ui/juice_bar.gd
 */
import Phaser from 'phaser';
import { JuiceConfig } from '../config/JuiceConfig.js';
import { JuicePalette } from './JuicePalette.js';
import { JuiceTween } from '../core/JuiceTween.js';

export class JuiceBar extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} [config]
   */
  constructor(scene, x, y, config = {}) {
    super(scene, x, y);

    this.barWidth = config.width ?? 280;
    this.barHeight = config.height ?? 28;
    this.radius = config.radius ?? 8;
    this.maxVal = config.max ?? 100;
    this.currentVal = config.value ?? this.maxVal;
    this.barType = config.type ?? 'health'; // 'health' | 'mana' | 'shield' | 'energy' | 'custom'
    this.fillColor = config.fillColor ?? this.getDefaultColor(this.barType);
    this.showText = config.showText ?? true;
    this.labelPrefix = config.labelPrefix ?? '';

    this.currentPercent = Phaser.Math.Clamp(this.currentVal / this.maxVal, 0.0, 1.0);
    this.ghostPercent = this.currentPercent;

    this.ghostTween = null;
    this.mainTween = null;
    this.ghostTimer = null;

    this.initVisuals();

    scene.add.existing(this);
  }

  getDefaultColor(type) {
    switch (type) {
      case 'mana':
        return JuicePalette.manaFill;
      case 'shield':
        return JuicePalette.shieldFill;
      case 'energy':
        return JuicePalette.energyFill;
      case 'health':
      default:
        return JuicePalette.healthFill;
    }
  }

  initVisuals() {
    const halfW = this.barWidth / 2;
    const halfH = this.barHeight / 2;

    // 1. Drop shadow
    this.shadowGfx = this.scene.add.graphics();
    this.shadowGfx.fillStyle(0x000000, 0.5);
    this.shadowGfx.fillRoundedRect(-halfW, -halfH + 3, this.barWidth, this.barHeight, this.radius);
    this.add(this.shadowGfx);

    // 2. Track / Background tray
    this.trackGfx = this.scene.add.graphics();
    this.trackGfx.fillStyle(JuicePalette.barTrack, 1.0);
    this.trackGfx.fillRoundedRect(-halfW, -halfH, this.barWidth, this.barHeight, this.radius);
    this.trackGfx.lineStyle(2, JuicePalette.surfaceBorder, 0.8);
    this.trackGfx.strokeRoundedRect(-halfW, -halfH, this.barWidth, this.barHeight, this.radius);
    this.add(this.trackGfx);

    // 3. Ghost Bar (White Trailing Bar)
    this.ghostGfx = this.scene.add.graphics();
    this.add(this.ghostGfx);

    // 4. Main Fill Bar
    this.mainGfx = this.scene.add.graphics();
    this.add(this.mainGfx);

    // 5. Border & Highlight Overlays
    this.highlightGfx = this.scene.add.graphics();
    this.highlightGfx.lineStyle(1.5, 0xffffff, 0.35);
    this.highlightGfx.strokeRoundedRect(-halfW + 1, -halfH + 1, this.barWidth - 2, this.barHeight / 2, this.radius - 1);
    this.add(this.highlightGfx);

    // 6. Text Label
    if (this.showText) {
      this.labelText = this.scene.add.text(0, 0, this.getFormattedText(), {
        fontFamily: 'Bungee, sans-serif',
        fontSize: '13px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      });
      this.labelText.setOrigin(0.5, 0.5);
      this.add(this.labelText);
    }

    this.redrawBars();
  }

  getFormattedText() {
    const rounded = Math.round(this.currentVal);
    const max = Math.round(this.maxVal);
    if (this.labelPrefix) {
      return `${this.labelPrefix} ${rounded} / ${max}`;
    }
    return `${rounded} / ${max}`;
  }

  redrawBars() {
    const halfW = this.barWidth / 2;
    const halfH = this.barHeight / 2;
    const pad = 3;
    const maxFillWidth = this.barWidth - pad * 2;
    const fillHeight = this.barHeight - pad * 2;
    const r = Math.max(2, this.radius - 2);

    // Ghost Bar (Trailing White Bar)
    this.ghostGfx.clear();
    const ghostWidth = Math.max(0, maxFillWidth * this.ghostPercent);
    if (ghostWidth > 0) {
      this.ghostGfx.fillStyle(JuicePalette.ghostFill, 0.85);
      this.ghostGfx.fillRoundedRect(-halfW + pad, -halfH + pad, ghostWidth, fillHeight, r);
    }

    // Main Fill Bar
    this.mainGfx.clear();
    const mainWidth = Math.max(0, maxFillWidth * this.currentPercent);
    if (mainWidth > 0) {
      this.mainGfx.fillStyle(this.fillColor, 1.0);
      this.mainGfx.fillRoundedRect(-halfW + pad, -halfH + pad, mainWidth, fillHeight, r);

      // Top shine on main fill
      this.mainGfx.fillStyle(0xffffff, 0.22);
      this.mainGfx.fillRoundedRect(-halfW + pad, -halfH + pad, mainWidth, fillHeight * 0.45, { tl: r, tr: r, bl: 0, br: 0 });
    }
  }

  /**
   * Set value directly with animated dual-fill transition
   * @param {number} newValue
   * @param {number} [newMax]
   * @param {boolean} [animated=true]
   */
  setValue(newValue, newMax = null, animated = true) {
    if (newMax !== null) this.maxVal = Math.max(1, newMax);
    const prevVal = this.currentVal;
    this.currentVal = Phaser.Math.Clamp(newValue, 0, this.maxVal);

    const prevPercent = this.currentPercent;
    const targetPercent = this.currentVal / this.maxVal;

    if (!animated) {
      this.currentPercent = targetPercent;
      this.ghostPercent = targetPercent;
      if (this.labelText) this.labelText.setText(this.getFormattedText());
      this.redrawBars();
      return;
    }

    const isDamage = targetPercent < prevPercent;

    if (isDamage) {
      // 1. Damage case: Main bar drops immediately, ghost bar delays and drains
      if (this.ghostTimer) {
        clearTimeout(this.ghostTimer);
      }
      if (this.ghostTween) {
        this.ghostTween.stop();
      }

      // Main fill drops fast
      this.scene.tweens.add({
        targets: this,
        currentPercent: targetPercent,
        duration: JuiceConfig.bar.fillDuration,
        ease: JuiceConfig.bar.ease,
        onUpdate: () => {
          this.redrawBars();
        }
      });

      // Ghost bar waits then drains
      this.ghostTimer = setTimeout(() => {
        if (!this.scene) return;
        this.ghostTween = this.scene.tweens.add({
          targets: this,
          ghostPercent: targetPercent,
          duration: JuiceConfig.bar.ghostDuration,
          ease: JuiceConfig.bar.ghostEase,
          onUpdate: () => {
            this.redrawBars();
          }
        });
      }, JuiceConfig.bar.ghostDelay);

      // Scale punch on taking damage
      JuiceTween.punchScale(this.scene, this, { factorX: 1.05, factorY: 0.95, duration: 140 });

    } else {
      // 2. Heal / Gain case: Main bar expands smoothly, ghost bar updates alongside
      if (this.ghostTimer) clearTimeout(this.ghostTimer);
      if (this.ghostTween) this.ghostTween.stop();

      this.scene.tweens.add({
        targets: this,
        currentPercent: targetPercent,
        ghostPercent: targetPercent,
        duration: JuiceConfig.bar.fillDuration * 1.4,
        ease: 'Back.easeOut',
        onUpdate: () => {
          this.redrawBars();
        }
      });

      JuiceTween.punchScale(this.scene, this, { factorX: 1.04, factorY: 1.08, duration: 160 });
    }

    if (this.labelText) {
      this.labelText.setText(this.getFormattedText());
    }
  }

  /**
   * Decrease bar value (damage)
   * @param {number} amount
   */
  damage(amount) {
    this.setValue(this.currentVal - amount, null, true);
  }

  /**
   * Increase bar value (heal)
   * @param {number} amount
   */
  heal(amount) {
    this.setValue(this.currentVal + amount, null, true);
  }

  getValue() {
    return this.currentVal;
  }

  getMax() {
    return this.maxVal;
  }

  getPercent() {
    return this.currentPercent;
  }

  destroy(fromScene) {
    if (this.ghostTimer) {
      clearTimeout(this.ghostTimer);
    }
    super.destroy(fromScene);
  }
}

export default JuiceBar;
