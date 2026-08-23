/**
 * JuiceTime - Time Dilation & Hit Stop (Frame Freeze) Manager
 * Ported from Godot 4 scripts/core/juice_time.gd
 */
import Phaser from 'phaser';
import { JuiceConfig } from '../config/JuiceConfig.js';

export class JuiceTime {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.currentScale = 1.0;
    this.activeTimer = null;
    this.activeTween = null;
  }

  /**
   * Directly set the scene time scale
   * @param {number} scale
   */
  setTimeScale(scale) {
    this.currentScale = Math.max(0.0001, scale);
    if (this.scene && this.scene.time) {
      this.scene.time.timeScale = this.currentScale;
    }
    if (this.scene && this.scene.physics && this.scene.physics.world) {
      this.scene.physics.world.timeScale = 1.0 / this.currentScale;
    }
  }

  /**
   * Get current time scale
   */
  getTimeScale() {
    return this.currentScale;
  }

  /**
   * Trigger a hit-stop (instant frame freeze on impact)
   * Uses real wall-clock timeout to guarantee restoration even at 0 timescale.
   * @param {number} [durationMs] - Duration in ms
   * @param {number} [freezeScale] - Slowed scale during freeze
   * @param {Function} [onComplete]
   */
  hitStop(
    durationMs = JuiceConfig.time.hitStopDefaultMs,
    freezeScale = JuiceConfig.time.hitStopFreezeScale,
    onComplete = null
  ) {
    this.clearPending();

    const previousScale = this.currentScale;
    this.setTimeScale(freezeScale);

    this.activeTimer = setTimeout(() => {
      this.setTimeScale(previousScale);
      this.activeTimer = null;
      if (onComplete) onComplete();
    }, durationMs);
  }

  /**
   * Trigger smooth or stepped slow-motion (bullet time)
   * @param {number} [scale=0.25]
   * @param {number} [durationMs=1200]
   * @param {boolean} [smooth=true]
   * @param {Function} [onComplete]
   */
  slowMotion(
    scale = JuiceConfig.time.slowMotionScale,
    durationMs = JuiceConfig.time.slowMotionDefaultMs,
    smooth = true,
    onComplete = null
  ) {
    this.clearPending();

    if (!smooth) {
      this.setTimeScale(scale);
      this.activeTimer = setTimeout(() => {
        this.setTimeScale(1.0);
        this.activeTimer = null;
        if (onComplete) onComplete();
      }, durationMs);
      return;
    }

    // Smooth transition into slow-mo and back
    const halfDuration = durationMs * 0.4;
    const holdDuration = durationMs * 0.2;

    const proxy = { scale: this.currentScale };

    this.activeTween = this.scene.tweens.add({
      targets: proxy,
      scale: scale,
      duration: halfDuration,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        this.setTimeScale(proxy.scale);
      },
      onComplete: () => {
        this.activeTimer = setTimeout(() => {
          this.activeTween = this.scene.tweens.add({
            targets: proxy,
            scale: 1.0,
            duration: halfDuration,
            ease: 'Quad.easeInOut',
            onUpdate: () => {
              this.setTimeScale(proxy.scale);
            },
            onComplete: () => {
              this.setTimeScale(1.0);
              this.activeTween = null;
              this.activeTimer = null;
              if (onComplete) onComplete();
            }
          });
        }, holdDuration);
      }
    });
  }

  /**
   * Cancel any running hit-stop or slow-motion
   */
  clearPending() {
    if (this.activeTimer) {
      clearTimeout(this.activeTimer);
      this.activeTimer = null;
    }
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }
  }

  /**
   * Reset time scale to normal 1.0
   */
  reset() {
    this.clearPending();
    this.setTimeScale(1.0);
  }

  /**
   * Clean up timers and reset
   */
  destroy() {
    this.reset();
  }
}

export default JuiceTime;
