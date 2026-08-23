/**
 * Juice - Central Facade Singleton for all Game Juice and Visual Polish
 * Ported from Godot 4 scripts/core/juice.gd
 */
import { JuiceConfig } from '../config/JuiceConfig.js';
import { JuiceTween } from './JuiceTween.js';
import { ShakeCamera2D } from './ShakeCamera2D.js';
import { JuiceTime } from './JuiceTime.js';
import { JuiceSFX } from './JuiceSFX.js';
import { DamageNumbers } from './DamageNumbers.js';
import { HitFlash } from './HitFlash.js';
import { ScreenFX } from './ScreenFX.js';

class JuiceManager {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.time = null;
    this.sfx = null;
    this.damageNumbers = null;
    this.screenFX = null;
    this.toastLayer = null;
    this.config = JuiceConfig;
  }

  /**
   * Initialize Juice systems for a given active scene
   * @param {Phaser.Scene} scene
   * @param {Object} [options]
   */
  init(scene, options = {}) {
    this.scene = scene;
    this.camera = new ShakeCamera2D(scene);
    this.time = new JuiceTime(scene);
    this.sfx = new JuiceSFX(scene);
    this.damageNumbers = new DamageNumbers(scene);
    this.screenFX = new ScreenFX(scene);

    scene.events.once('shutdown', () => {
      this.destroy();
    });

    return this;
  }

  /**
   * Set reference to active ToastLayer
   * @param {ToastLayer} layer
   */
  setToastLayer(layer) {
    this.toastLayer = layer;
  }

  /**
   * Trigger screen shake
   * @param {'light'|'medium'|'heavy'|number} [strength='medium']
   */
  shake(strength = 'medium') {
    if (this.camera) {
      this.camera.shake(strength);
    }
  }

  /**
   * Trigger hit stop (momentary freeze frame on impact)
   * @param {number} [durationMs]
   * @param {number} [freezeScale]
   * @param {Function} [onComplete]
   */
  hitStop(durationMs, freezeScale, onComplete) {
    if (this.time) {
      this.time.hitStop(durationMs, freezeScale, onComplete);
    }
  }

  /**
   * Trigger slow motion
   * @param {number} [scale=0.25]
   * @param {number} [durationMs=1200]
   * @param {boolean} [smooth=true]
   */
  slowMotion(scale, durationMs, smooth) {
    if (this.time) {
      this.time.slowMotion(scale, durationMs, smooth);
    }
  }

  /**
   * Flash a GameObject
   * @param {Phaser.GameObjects.GameObject} target
   * @param {number} [duration]
   * @param {number} [color]
   */
  hitFlash(target, duration, color) {
    if (this.scene && target) {
      HitFlash.flash(this.scene, target, { duration, color });
    }
  }

  /**
   * Fullscreen flash
   * @param {number} [color=0xffffff]
   * @param {number} [alpha=0.6]
   * @param {number} [duration=250]
   */
  screenFlash(color, alpha, duration) {
    if (this.screenFX) {
      this.screenFX.flash(color, alpha, duration);
    }
  }

  /**
   * Spawn animated damage number
   * @param {number} x
   * @param {number} y
   * @param {number|string} amount
   * @param {Object} [options]
   */
  damage(x, y, amount, options = {}) {
    if (this.damageNumbers) {
      return this.damageNumbers.spawn(x, y, amount, options);
    }
    return null;
  }

  /**
   * Play dynamic sound effect
   * @param {string} bankOrKey
   * @param {Object} [options]
   */
  playSFX(bankOrKey, options = {}) {
    if (this.sfx) {
      return this.sfx.play(bankOrKey, options);
    }
    return null;
  }

  /**
   * Show toast notification
   * @param {string} title
   * @param {string} message
   * @param {'info'|'success'|'warning'|'error'} [type='info']
   * @param {number} [duration]
   */
  toast(title, message, type = 'info', duration = 3200) {
    if (this.toastLayer) {
      return this.toastLayer.show(title, message, type, duration);
    }
    return null;
  }

  /**
   * Scale punch target
   */
  punch(target, factor = 1.25, duration = 160) {
    if (this.scene && target) {
      return JuiceTween.punchScale(this.scene, target, { factor, duration });
    }
    return null;
  }

  /**
   * Squish target
   */
  squish(target, squishX = 1.15, squishY = 0.85, duration = 180) {
    if (this.scene && target) {
      return JuiceTween.squish(this.scene, target, { squishX, squishY, duration });
    }
    return null;
  }

  /**
   * Wobble target
   */
  wobble(target, angle = 12, duration = 250) {
    if (this.scene && target) {
      return JuiceTween.wobble(this.scene, target, { angle, duration });
    }
    return null;
  }

  /**
   * Clean up all active instances
   */
  destroy() {
    if (this.camera) this.camera.destroy();
    if (this.time) this.time.destroy();
    if (this.damageNumbers) this.damageNumbers.destroy();
    if (this.screenFX) this.screenFX.destroy();
    this.camera = null;
    this.time = null;
    this.sfx = null;
    this.damageNumbers = null;
    this.screenFX = null;
    this.toastLayer = null;
    this.scene = null;
  }
}

export const Juice = new JuiceManager();
export default Juice;
