/**
 * JuiceToast - Toast Notification Card Component
 * Ported from Godot 4 scripts/ui/juice_toast.gd
 */
import Phaser from 'phaser';
import { JuiceConfig } from '../config/JuiceConfig.js';
import { JuicePalette } from './JuicePalette.js';

export class JuiceToast extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} title
   * @param {string} message
   * @param {'info'|'success'|'warning'|'error'} [type='info']
   * @param {number} [duration=3200]
   * @param {Function} [onDismiss]
   */
  constructor(scene, x, y, title, message, type = 'info', duration = 3200, onDismiss = null) {
    super(scene, x, y);

    this.titleText = title;
    this.messageText = message;
    this.toastType = type;
    this.displayDuration = duration;
    this.onDismiss = onDismiss;

    this.cardWidth = JuiceConfig.toast.cardWidth;
    this.cardHeight = JuiceConfig.toast.cardHeight;
    this.dismissTimer = null;
    this.isDismissing = false;

    this.initVisuals();
    this.initTimer();

    scene.add.existing(this);
  }

  getTypeColor() {
    switch (this.toastType) {
      case 'success':
        return { color: JuicePalette.success, icon: '✓', hex: JuicePalette.successHex };
      case 'warning':
        return { color: JuicePalette.warning, icon: '!', hex: JuicePalette.warningHex };
      case 'error':
        return { color: JuicePalette.danger, icon: '✕', hex: JuicePalette.dangerHex };
      case 'info':
      default:
        return { color: JuicePalette.info, icon: 'ℹ', hex: JuicePalette.infoHex };
    }
  }

  initVisuals() {
    const typeInfo = this.getTypeColor();
    const halfW = this.cardWidth / 2;
    const halfH = this.cardHeight / 2;
    const radius = 8;

    // 1. Drop shadow
    this.shadowGfx = this.scene.add.graphics();
    this.shadowGfx.fillStyle(0x000000, 0.6);
    this.shadowGfx.fillRoundedRect(-halfW, -halfH + 4, this.cardWidth, this.cardHeight, radius);
    this.add(this.shadowGfx);

    // 2. Card background
    this.cardBg = this.scene.add.graphics();
    this.cardBg.fillStyle(JuicePalette.surface, 0.95);
    this.cardBg.fillRoundedRect(-halfW, -halfH, this.cardWidth, this.cardHeight, radius);
    this.cardBg.lineStyle(1.5, JuicePalette.surfaceBorder, 0.8);
    this.cardBg.strokeRoundedRect(-halfW, -halfH, this.cardWidth, this.cardHeight, radius);
    this.add(this.cardBg);

    // 3. Left accent strip
    this.accentStrip = this.scene.add.graphics();
    this.accentStrip.fillStyle(typeInfo.color, 1.0);
    this.accentStrip.fillRoundedRect(-halfW, -halfH, 6, this.cardHeight, { tl: radius, bl: radius, tr: 0, br: 0 });
    this.add(this.accentStrip);

    // 4. Type badge icon
    this.badgeBg = this.scene.add.graphics();
    this.badgeBg.fillStyle(typeInfo.color, 0.2);
    this.badgeBg.fillCircle(-halfW + 26, 0, 14);
    this.badgeBg.lineStyle(1.5, typeInfo.color, 0.8);
    this.badgeBg.strokeCircle(-halfW + 26, 0, 14);
    this.add(this.badgeBg);

    this.badgeIcon = this.scene.add.text(-halfW + 26, 0, typeInfo.icon, {
      fontFamily: 'Bungee, sans-serif',
      fontSize: '14px',
      color: typeInfo.hex
    });
    this.badgeIcon.setOrigin(0.5, 0.5);
    this.add(this.badgeIcon);

    // 5. Title & Message text
    this.titleLabel = this.scene.add.text(-halfW + 48, -12, this.titleText, {
      fontFamily: 'Bungee, sans-serif',
      fontSize: '13px',
      color: '#ffffff'
    });
    this.add(this.titleLabel);

    this.msgLabel = this.scene.add.text(-halfW + 48, 7, this.messageText, {
      fontFamily: 'sans-serif',
      fontSize: '11px',
      color: JuicePalette.textDimHex
    });
    this.add(this.msgLabel);

    // 6. Progress countdown bar at bottom
    this.progressGfx = this.scene.add.graphics();
    this.add(this.progressGfx);

    // Make interactive to click & dismiss
    this.setSize(this.cardWidth, this.cardHeight);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-halfW, -halfH, this.cardWidth, this.cardHeight),
      Phaser.Geom.Rectangle.Contains
    );
    this.on('pointerdown', () => this.dismiss());
  }

  initTimer() {
    const halfW = this.cardWidth / 2;
    const halfH = this.cardHeight / 2;
    const typeInfo = this.getTypeColor();

    const progressProxy = { widthRatio: 1.0 };
    this.progressTween = this.scene.tweens.add({
      targets: progressProxy,
      widthRatio: 0.0,
      duration: this.displayDuration,
      ease: 'Linear',
      onUpdate: () => {
        if (!this.progressGfx || !this.scene) return;
        this.progressGfx.clear();
        this.progressGfx.fillStyle(typeInfo.color, 0.7);
        this.progressGfx.fillRect(-halfW + 6, halfH - 3, (this.cardWidth - 12) * progressProxy.widthRatio, 3);
      }
    });

    this.dismissTimer = setTimeout(() => {
      this.dismiss();
    }, this.displayDuration);
  }

  dismiss() {
    if (this.isDismissing) return;
    this.isDismissing = true;

    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }

    if (this.progressTween) {
      this.progressTween.stop();
    }

    this.scene.tweens.add({
      targets: this,
      x: this.x + 120,
      alpha: 0,
      scaleY: 0.7,
      duration: JuiceConfig.toast.fadeDuration,
      ease: JuiceConfig.toast.fadeEase,
      onComplete: () => {
        if (this.onDismiss) {
          this.onDismiss(this);
        }
        this.destroy();
      }
    });
  }

  destroy(fromScene) {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
    }
    super.destroy(fromScene);
  }
}

export default JuiceToast;
