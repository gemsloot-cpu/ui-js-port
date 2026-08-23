/**
 * HitFlash - GameObject Hit Flash Feedback Utility
 * Ported from Godot 4 scripts/core/hit_flash.gd
 */
import Phaser from 'phaser';
import { JuiceConfig } from '../config/JuiceConfig.js';
import { HitFlashPipeline } from '../shaders/HitFlashPipeline.js';

export class HitFlash {
  /**
   * Flash a GameObject with white or custom color
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.GameObject} target
   * @param {Object} [options]
   */
  static flash(scene, target, options = {}) {
    if (!target || !target.scene) return null;

    const duration = options.duration ?? JuiceConfig.flash.duration;
    const color = options.color ?? JuiceConfig.flash.defaultColor;

    // Check if target supports PostFX Pipeline and renderer is WebGL
    if (scene.renderer && scene.renderer.type === Phaser.WEBGL && typeof target.setPostPipeline === 'function') {
      try {
        let pipeline = target.getPostPipeline(HitFlashPipeline) || target.getPostPipeline('HitFlashPipeline');
        if (!pipeline) {
          target.setPostPipeline(HitFlashPipeline);
          pipeline = target.getPostPipeline(HitFlashPipeline) || target.getPostPipeline('HitFlashPipeline');
        }
        if (pipeline && typeof pipeline.flash === 'function') {
          pipeline.flash(scene, duration, color, options.onComplete);
          return pipeline;
        }
      } catch (e) {
        // Fall back to tint
      }
    }

    // Fallback: Tint or Alpha Flash
    if (typeof target.setTintFill === 'function') {
      target.setTintFill(color);
      return scene.time.delayedCall(duration, () => {
        if (target && target.clearTint) {
          target.clearTint();
        }
        if (options.onComplete) options.onComplete();
      });
    } else if (typeof target.setTint === 'function') {
      const origTint = target.tintTopLeft || 0xffffff;
      target.setTint(color);
      return scene.time.delayedCall(duration, () => {
        if (target && target.setTint) {
          target.setTint(origTint);
        }
        if (options.onComplete) options.onComplete();
      });
    }

    return null;
  }
}

export default HitFlash;
