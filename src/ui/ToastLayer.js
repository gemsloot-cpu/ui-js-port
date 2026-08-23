/**
 * ToastLayer - Notification Manager & Upward Shifting Toast Stack
 * Ported from Godot 4 scripts/ui/toast_layer.gd
 */
import Phaser from 'phaser';
import { JuiceToast } from './JuiceToast.js';
import { JuiceConfig } from '../config/JuiceConfig.js';

export class ToastLayer extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} [config]
   */
  constructor(scene, config = {}) {
    super(scene, 0, 0);

    this.maxToasts = config.maxToasts ?? 5;
    this.anchorPosition = config.anchor ?? 'bottom-right'; // 'bottom-right' | 'top-right'
    this.toasts = [];

    this.setDepth(2000);
    this.setScrollFactor(0);

    scene.add.existing(this);

    // Keep positioned during window resize
    scene.scale.on('resize', () => {
      this.repositionToasts(false);
    });
  }

  /**
   * Show a new toast and smoothly shift existing toasts upwards
   * @param {string} title
   * @param {string} message
   * @param {'info'|'success'|'warning'|'error'} [type='info']
   * @param {number} [duration=3200]
   */
  show(title, message, type = 'info', duration = 3200) {
    // Dismiss oldest if capacity reached
    if (this.toasts.length >= this.maxToasts) {
      const oldest = this.toasts[0];
      if (oldest) oldest.dismiss();
    }

    const { targetX, spawnX, startY } = this.getSpawnCoordinates();

    const toast = new JuiceToast(
      this.scene,
      spawnX,
      startY,
      title,
      message,
      type,
      duration,
      (dismissedToast) => {
        this.removeToast(dismissedToast);
      }
    );

    this.add(toast);
    this.toasts.push(toast);

    // Slide in from right with Back.easeOut
    this.scene.tweens.add({
      targets: toast,
      x: targetX,
      duration: JuiceConfig.toast.slideDuration,
      ease: JuiceConfig.toast.slideEase
    });

    // Play subtle toast notification sound
    if (this.scene.juice && this.scene.juice.playSFX) {
      if (type === 'error') {
        this.scene.juice.playSFX('error', { volume: 0.6 });
      } else if (type === 'success') {
        this.scene.juice.playSFX('confirm', { volume: 0.6 });
      } else {
        this.scene.juice.playSFX('pickup', { volume: 0.6 });
      }
    }

    // Shift all toasts upwards
    this.repositionToasts(true);

    return toast;
  }

  getSpawnCoordinates() {
    const { width, height } = this.scene.scale;
    const cardWidth = JuiceConfig.toast.cardWidth;
    const cardHeight = JuiceConfig.toast.cardHeight;
    const margin = 20;

    const targetX = width - cardWidth / 2 - margin;
    const spawnX = width + cardWidth / 2 + 10;
    const startY = height - cardHeight / 2 - margin;

    return { targetX, spawnX, startY };
  }

  /**
   * Reposition existing toasts in the stack with smooth upward animation
   * @param {boolean} [animated=true]
   */
  repositionToasts(animated = true) {
    const { width, height } = this.scene.scale;
    const cardWidth = JuiceConfig.toast.cardWidth;
    const cardHeight = JuiceConfig.toast.cardHeight;
    const spacing = JuiceConfig.toast.spacing;
    const margin = 20;

    const targetX = width - cardWidth / 2 - margin;
    const baseY = height - cardHeight / 2 - margin;

    for (let i = 0; i < this.toasts.length; i++) {
      const toast = this.toasts[i];
      // Index counting backwards from newest: newest is index 0 at bottom
      const stackIndex = this.toasts.length - 1 - i;
      const targetY = baseY - stackIndex * (cardHeight + spacing);

      if (!animated) {
        toast.setPosition(targetX, targetY);
      } else {
        this.scene.tweens.killTweensOf(toast, ['y']);
        this.scene.tweens.add({
          targets: toast,
          y: targetY,
          duration: 250,
          ease: 'Back.easeOut'
        });
      }
    }
  }

  removeToast(toast) {
    const idx = this.toasts.indexOf(toast);
    if (idx !== -1) {
      this.toasts.splice(idx, 1);
      this.repositionToasts(true);
    }
  }

  clearAll() {
    for (const t of [...this.toasts]) {
      t.dismiss();
    }
  }
}

export default ToastLayer;
