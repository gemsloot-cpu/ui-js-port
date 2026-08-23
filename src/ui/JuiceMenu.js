/**
 * JuiceMenu - Animated Modal Dialog Window with JuiceBackdrop
 * Ported from Godot 4 scripts/ui/juice_menu.gd
 */
import Phaser from 'phaser';
import { JuicePalette } from './JuicePalette.js';
import { JuiceBackdrop } from './JuiceBackdrop.js';
import { JuiceButton } from './JuiceButton.js';
import { JuiceConfig } from '../config/JuiceConfig.js';
import { JuiceTween } from '../core/JuiceTween.js';

export class JuiceMenu extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} [config]
   */
  constructor(scene, config = {}) {
    const { width: screenW, height: screenH } = scene.scale;
    super(scene, screenW / 2, screenH / 2);

    this.menuWidth = config.width ?? 460;
    this.menuHeight = config.height ?? 340;
    this.titleText = config.title ?? 'JUICE MODAL DIALOG';
    this.bodyText = config.message ?? 'This modal dialog demonstrates tactile opening transitions with Backdrop dimming, elastic scaling, and interactive button controls.';
    this.onClose = config.onClose ?? null;
    this.onConfirm = config.onConfirm ?? null;

    this.setDepth(config.depth ?? 1600);
    this.setScrollFactor(0);
    this.setVisible(false);
    this.setScale(0.7);
    this.setAlpha(0);

    this.isOpen = false;

    // 1. Create Backdrop
    this.backdrop = new JuiceBackdrop(scene, {
      depth: (config.depth ?? 1600) - 10,
      onClick: () => {
        if (config.closeOnBackdropClick !== false) {
          this.close();
        }
      }
    });

    this.initVisuals();

    // Resize handler
    scene.scale.on('resize', (gameSize) => {
      this.setPosition(gameSize.width / 2, gameSize.height / 2);
    });

    scene.add.existing(this);
  }

  initVisuals() {
    const halfW = this.menuWidth / 2;
    const halfH = this.menuHeight / 2;
    const radius = 14;

    // 1. Large Drop Shadow
    this.shadowGfx = this.scene.add.graphics();
    this.shadowGfx.fillStyle(0x000000, 0.65);
    this.shadowGfx.fillRoundedRect(-halfW, -halfH + 8, this.menuWidth, this.menuHeight, radius);
    this.add(this.shadowGfx);

    // 2. Card Surface Background
    this.cardBg = this.scene.add.graphics();
    this.cardBg.fillStyle(JuicePalette.surface, 0.98);
    this.cardBg.fillRoundedRect(-halfW, -halfH, this.menuWidth, this.menuHeight, radius);
    this.cardBg.lineStyle(2.5, JuicePalette.surfaceBorder, 0.9);
    this.cardBg.strokeRoundedRect(-halfW, -halfH, this.menuWidth, this.menuHeight, radius);
    this.add(this.cardBg);

    // 3. Header Accent Bar
    this.headerBg = this.scene.add.graphics();
    this.headerBg.fillStyle(JuicePalette.surfaceLight, 1.0);
    this.headerBg.fillRoundedRect(-halfW, -halfH, this.menuWidth, 54, { tl: radius, tr: radius, bl: 0, br: 0 });
    this.headerBg.lineStyle(1.5, JuicePalette.primary, 0.8);
    this.headerBg.lineBetween(-halfW, -halfH + 54, halfW, -halfH + 54);
    this.add(this.headerBg);

    // 4. Header Title
    this.titleLabel = this.scene.add.text(-halfW + 20, -halfH + 16, this.titleText, {
      fontFamily: 'Bungee, sans-serif',
      fontSize: '16px',
      color: JuicePalette.textLightHex,
      stroke: '#000000',
      strokeThickness: 2
    });
    this.add(this.titleLabel);

    // 5. Close 'X' button
    this.closeBtn = new JuiceButton(this.scene, halfW - 28, -halfH + 26, '✕', {
      width: 34,
      height: 34,
      theme: 'surface',
      fontSize: '14px',
      onClick: () => this.close()
    });
    this.add(this.closeBtn);

    // 6. Body Text
    this.bodyLabel = this.scene.add.text(0, -20, this.bodyText, {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: JuicePalette.textDimHex,
      align: 'center',
      wordWrap: { width: this.menuWidth - 50, useAdvancedWrap: true },
      lineSpacing: 6
    });
    this.bodyLabel.setOrigin(0.5, 0.5);
    this.add(this.bodyLabel);

    // 7. Decorative Accent Line
    this.accentGfx = this.scene.add.graphics();
    this.accentGfx.lineStyle(2, JuicePalette.accent, 0.6);
    this.accentGfx.strokeRoundedRect(-60, 42, 120, 2, 1);
    this.add(this.accentGfx);

    // 8. Action Buttons at bottom
    this.confirmBtn = new JuiceButton(this.scene, 80, halfH - 45, 'CONFIRM', {
      width: 140,
      height: 42,
      theme: 'success',
      fontSize: '13px',
      onClick: () => {
        if (this.onConfirm) this.onConfirm();
        this.close();
      }
    });
    this.add(this.confirmBtn);

    this.cancelBtn = new JuiceButton(this.scene, -80, halfH - 45, 'CANCEL', {
      width: 140,
      height: 42,
      theme: 'danger',
      fontSize: '13px',
      onClick: () => this.close()
    });
    this.add(this.cancelBtn);
  }

  /**
   * Open modal dialog
   * @param {Object} [options]
   */
  open(options = {}) {
    if (this.isOpen) return;
    this.isOpen = true;

    if (options.title) this.titleLabel.setText(options.title);
    if (options.message) this.bodyLabel.setText(options.message);

    this.backdrop.fadeIn(250);

    this.setVisible(true);
    this.setScale(0.75);
    this.setAlpha(0);

    // Play confirm sound
    if (this.scene.juice && this.scene.juice.playSFX) {
      this.scene.juice.playSFX('confirm', { volume: 0.8 });
    }

    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: 1.0,
      duration: JuiceConfig.menu.openDuration,
      ease: JuiceConfig.menu.openEase,
      onComplete: () => {
        if (options.onComplete) options.onComplete();
      }
    });
  }

  /**
   * Close modal dialog
   * @param {Function} [onComplete]
   */
  close(onComplete = null) {
    if (!this.isOpen) return;
    this.isOpen = false;

    this.backdrop.fadeOut(200);

    if (this.scene.juice && this.scene.juice.playSFX) {
      this.scene.juice.playSFX('click', { volume: 0.7, rate: 0.9 });
    }

    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.75,
      scaleY: 0.75,
      alpha: 0,
      duration: JuiceConfig.menu.closeDuration,
      ease: JuiceConfig.menu.closeEase,
      onComplete: () => {
        this.setVisible(false);
        if (this.onClose) this.onClose();
        if (onComplete) onComplete();
      }
    });
  }

  destroy(fromScene) {
    if (this.backdrop) {
      this.backdrop.destroy();
    }
    super.destroy(fromScene);
  }
}

export default JuiceMenu;
