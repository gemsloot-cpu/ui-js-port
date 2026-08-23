/**
 * JuiceTween - Phaser 3 Tweening & Juicing Utilities
 * Ported from Godot 4 scripts/core/juice_tween.gd
 */
import Phaser from 'phaser';

export class JuiceTween {
  /**
   * Scale punch effect (spring scale out and return)
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.GameObject} target
   * @param {Object} options
   */
  static punchScale(scene, target, options = {}) {
    if (!target || !target.scene) return null;

    const baseScaleX = options.baseScaleX ?? (target.baseScaleX ?? target.scaleX);
    const baseScaleY = options.baseScaleY ?? (target.baseScaleY ?? target.scaleY);
    const factorX = options.factorX ?? options.factor ?? 1.2;
    const factorY = options.factorY ?? options.factor ?? 1.2;
    const duration = options.duration ?? 160;
    const ease = options.ease ?? 'Back.easeOut';

    // Stop existing scale tweens on target if any
    scene.tweens.killTweensOf(target, ['scaleX', 'scaleY']);

    target.setScale(baseScaleX * factorX, baseScaleY * factorY);

    return scene.tweens.add({
      targets: target,
      scaleX: baseScaleX,
      scaleY: baseScaleY,
      duration,
      ease,
      onComplete: () => {
        target.setScale(baseScaleX, baseScaleY);
        if (options.onComplete) options.onComplete();
      }
    });
  }

  /**
   * Squish & stretch animation (typically on button press or jump impact)
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.GameObject} target
   * @param {Object} options
   */
  static squish(scene, target, options = {}) {
    if (!target || !target.scene) return null;

    const baseScaleX = options.baseScaleX ?? (target.baseScaleX ?? target.scaleX);
    const baseScaleY = options.baseScaleY ?? (target.baseScaleY ?? target.scaleY);
    const squishX = options.squishX ?? 1.15;
    const squishY = options.squishY ?? 0.85;
    const duration = options.duration ?? 180;
    const ease = options.ease ?? 'Elastic.easeOut';

    scene.tweens.killTweensOf(target, ['scaleX', 'scaleY']);

    target.setScale(baseScaleX * squishX, baseScaleY * squishY);

    return scene.tweens.add({
      targets: target,
      scaleX: baseScaleX,
      scaleY: baseScaleY,
      duration,
      ease,
      onComplete: () => {
        target.setScale(baseScaleX, baseScaleY);
        if (options.onComplete) options.onComplete();
      }
    });
  }

  /**
   * Rotation punch / wobble
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.GameObject} target
   * @param {Object} options
   */
  static wobble(scene, target, options = {}) {
    if (!target || !target.scene) return null;

    const baseAngle = options.baseAngle ?? 0;
    const angleOffset = options.angle ?? 12; // Degrees
    const duration = options.duration ?? 250;

    scene.tweens.killTweensOf(target, ['angle']);

    target.setAngle(baseAngle - angleOffset);

    return scene.tweens.add({
      targets: target,
      angle: baseAngle,
      duration,
      ease: 'Elastic.easeOut',
      onComplete: () => {
        target.setAngle(baseAngle);
        if (options.onComplete) options.onComplete();
      }
    });
  }

  /**
   * Position punch (recoil / knockback)
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.GameObject} target
   * @param {Object} options
   */
  static punchPosition(scene, target, options = {}) {
    if (!target || !target.scene) return null;

    const baseX = options.baseX ?? target.x;
    const baseY = options.baseY ?? target.y;
    const offsetX = options.offsetX ?? 0;
    const offsetY = options.offsetY ?? -15;
    const duration = options.duration ?? 200;
    const ease = options.ease ?? 'Back.easeOut';

    scene.tweens.killTweensOf(target, ['x', 'y']);

    target.setPosition(baseX + offsetX, baseY + offsetY);

    return scene.tweens.add({
      targets: target,
      x: baseX,
      y: baseY,
      duration,
      ease,
      onComplete: () => {
        target.setPosition(baseX, baseY);
        if (options.onComplete) options.onComplete();
      }
    });
  }

  /**
   * Float / Bobbing ambient idle animation
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.GameObject} target
   * @param {Object} options
   */
  static floatIdle(scene, target, options = {}) {
    if (!target || !target.scene) return null;

    const distance = options.distance ?? 6;
    const duration = options.duration ?? 1600;
    const baseY = target.y;

    return scene.tweens.add({
      targets: target,
      y: baseY - distance,
      duration: duration / 2,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Fade in or out
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.GameObject} target
   * @param {Object} options
   */
  static fade(scene, target, options = {}) {
    if (!target || !target.scene) return null;

    const fromAlpha = options.from ?? target.alpha;
    const toAlpha = options.to ?? 1.0;
    const duration = options.duration ?? 250;
    const ease = options.ease ?? 'Quad.easeOut';

    target.setAlpha(fromAlpha);

    return scene.tweens.add({
      targets: target,
      alpha: toAlpha,
      duration,
      ease,
      onComplete: () => {
        if (options.onComplete) options.onComplete();
      }
    });
  }
}

export default JuiceTween;
