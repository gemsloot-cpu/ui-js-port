/**
 * JuiceButton - Interactive Container-based Button with Tactile Polish
 * Ported from Godot 4 scripts/ui/juice_button.gd
 */
import Phaser from 'phaser';
import { JuiceConfig } from '../config/JuiceConfig.js';
import { JuicePalette } from './JuicePalette.js';
import { JuiceTween } from '../core/JuiceTween.js';

export class JuiceButton extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} text
   * @param {Object} [config]
   */
  constructor(scene, x, y, text = 'BUTTON', config = {}) {
    super(scene, x, y);

    this.btnText = text;
    this.width = config.width ?? 180;
    this.height = config.height ?? 50;
    this.theme = config.theme ?? 'primary'; // 'primary' | 'secondary' | 'accent' | 'danger' | 'success'
    this.fontSize = config.fontSize ?? '16px';
    this.iconKey = config.iconKey ?? null;
    this.onClick = config.onClick ?? null;
    this.disabled = config.disabled ?? false;
    this.soundBank = config.soundBank ?? 'click';

    this.baseScaleX = 1.0;
    this.baseScaleY = 1.0;
    this.isHovered = false;
    this.isPressed = false;

    this.initVisuals();
    this.initInteractions();

    scene.add.existing(this);
  }

  getThemeColors() {
    switch (this.theme) {
      case 'secondary':
        return {
          fill: JuicePalette.secondary,
          dark: JuicePalette.secondaryDark,
          light: JuicePalette.secondaryLight,
          text: JuicePalette.textLightHex
        };
      case 'accent':
        return {
          fill: JuicePalette.accent,
          dark: JuicePalette.accentDark,
          light: JuicePalette.accentLight,
          text: JuicePalette.textDarkHex
        };
      case 'danger':
        return {
          fill: JuicePalette.danger,
          dark: 0xba1a40,
          light: 0xff758f,
          text: JuicePalette.textLightHex
        };
      case 'success':
        return {
          fill: JuicePalette.success,
          dark: 0x049a73,
          light: 0x38ef7d,
          text: JuicePalette.textLightHex
        };
      case 'surface':
        return {
          fill: JuicePalette.surface,
          dark: 0x111122,
          light: JuicePalette.surfaceBorder,
          text: JuicePalette.textLightHex
        };
      case 'primary':
      default:
        return {
          fill: JuicePalette.primary,
          dark: JuicePalette.primaryDark,
          light: JuicePalette.primaryLight,
          text: JuicePalette.textLightHex
        };
    }
  }

  initVisuals() {
    const colors = this.getThemeColors();
    const halfW = this.width / 2;
    const halfH = this.height / 2;
    const radius = 10;

    // 1. Shadow Bottom Layer (3D tactile depth)
    this.shadowBg = this.scene.add.graphics();
    this.shadowBg.fillStyle(0x000000, 0.45);
    this.shadowBg.fillRoundedRect(-halfW, -halfH + 4, this.width, this.height, radius);
    this.add(this.shadowBg);

    // 2. Base Dark Bevel
    this.bevelBg = this.scene.add.graphics();
    this.bevelBg.fillStyle(colors.dark, 1.0);
    this.bevelBg.fillRoundedRect(-halfW, -halfH + 3, this.width, this.height, radius);
    this.add(this.bevelBg);

    // 3. Top Face Background
    this.mainBg = this.scene.add.graphics();
    this.drawFace(colors.fill, colors.light);
    this.add(this.mainBg);

    // 4. Glow / Highlight border outline
    this.glowBorder = this.scene.add.graphics();
    this.glowBorder.lineStyle(2.5, 0xffffff, 0.0);
    this.glowBorder.strokeRoundedRect(-halfW, -halfH, this.width, this.height, radius);
    this.add(this.glowBorder);

    // 5. Button Text & Optional Icon
    let textX = 0;
    if (this.iconKey && this.scene.textures.exists(this.iconKey)) {
      this.icon = this.scene.add.image(-halfW + 28, 0, this.iconKey);
      this.icon.setDisplaySize(22, 22);
      this.add(this.icon);
      textX = 12;
    }

    this.label = this.scene.add.text(textX, 0, this.btnText, {
      fontFamily: 'Bungee, sans-serif',
      fontSize: this.fontSize,
      color: colors.text,
      align: 'center'
    });
    this.label.setOrigin(0.5, 0.5);
    this.add(this.label);

    if (this.disabled) {
      this.applyDisabledState();
    }
  }

  drawFace(fillColor, lightColor) {
    const halfW = this.width / 2;
    const halfH = this.height / 2;
    const radius = 10;

    this.mainBg.clear();
    this.mainBg.fillStyle(fillColor, 1.0);
    this.mainBg.fillRoundedRect(-halfW, -halfH, this.width, this.height - 2, radius);

    // Top highlight rim
    this.mainBg.lineStyle(1.5, lightColor, 0.6);
    this.mainBg.strokeRoundedRect(-halfW + 1, -halfH + 1, this.width - 2, this.height - 4, radius - 1);
  }

  initInteractions() {
    this.setSize(this.width, this.height);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-this.width / 2, -this.height / 2, this.width, this.height),
      Phaser.Geom.Rectangle.Contains
    );

    this.on('pointerover', this.onPointerOver, this);
    this.on('pointerout', this.onPointerOut, this);
    this.on('pointerdown', this.onPointerDown, this);
    this.on('pointerup', this.onPointerUp, this);
  }

  onPointerOver(pointer) {
    if (this.disabled) return;
    this.isHovered = true;

    // Hover sound
    if (this.scene.juice && this.scene.juice.playSFX) {
      this.scene.juice.playSFX('click', { volume: 0.35, rate: 1.4 });
    }

    // Hover scale & glow tween
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: JuiceConfig.button.hoverScale,
      scaleY: JuiceConfig.button.hoverScale,
      y: this.y + JuiceConfig.button.hoverLiftY,
      duration: JuiceConfig.button.hoverDuration,
      ease: JuiceConfig.button.easeIn
    });

    this.setGlow(0.7);
  }

  onPointerOut(pointer) {
    if (this.disabled) return;
    this.isHovered = false;
    this.isPressed = false;

    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: JuiceConfig.button.releaseDuration,
      ease: JuiceConfig.button.easeOut
    });

    this.setGlow(0.0);
  }

  onPointerDown(pointer) {
    if (this.disabled) return;
    this.isPressed = true;

    // Play click sound
    if (this.scene.juice && this.scene.juice.playSFX) {
      this.scene.juice.playSFX(this.soundBank, { volume: 0.9 });
    }

    // Squish scale punch
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: JuiceConfig.button.pressScale * 1.04,
      scaleY: JuiceConfig.button.pressScale * 0.94,
      duration: JuiceConfig.button.squishDuration,
      ease: 'Quad.easeOut'
    });
  }

  onPointerUp(pointer) {
    if (this.disabled || !this.isPressed) return;
    this.isPressed = false;

    // Release bounce
    const targetScale = this.isHovered ? JuiceConfig.button.hoverScale : 1.0;

    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: targetScale,
      scaleY: targetScale,
      duration: JuiceConfig.button.releaseDuration,
      ease: JuiceConfig.button.easeOut,
      onComplete: () => {
        if (this.onClick && this.isHovered) {
          this.onClick(this);
        }
      }
    });
  }

  setGlow(alpha) {
    const halfW = this.width / 2;
    const halfH = this.height / 2;
    const radius = 10;
    const colors = this.getThemeColors();

    this.glowBorder.clear();
    if (alpha > 0) {
      this.glowBorder.lineStyle(3, colors.light, alpha);
      this.glowBorder.strokeRoundedRect(-halfW, -halfH, this.width, this.height, radius);
    }
  }

  setText(newText) {
    this.btnText = newText;
    if (this.label) {
      this.label.setText(newText);
    }
    return this;
  }

  setDisabled(disabled) {
    this.disabled = Boolean(disabled);
    if (this.disabled) {
      this.applyDisabledState();
    } else {
      this.restoreActiveState();
    }
    return this;
  }

  applyDisabledState() {
    this.setAlpha(0.45);
    this.setGlow(0.0);
    this.disableInteractive();
  }

  restoreActiveState() {
    this.setAlpha(1.0);
    this.setInteractive();
  }
}

export default JuiceButton;
