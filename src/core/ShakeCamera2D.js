/**
 * ShakeCamera2D - Trauma-based Screen Shake Controller
 * Ported from Godot 4 scripts/core/shake_camera_2d.gd
 */
import Phaser from 'phaser';
import { JuiceConfig } from '../config/JuiceConfig.js';

export class ShakeCamera2D {
  /**
   * @param {Phaser.Scene} scene
   * @param {Phaser.Cameras.Scene2D.Camera} [camera]
   */
  constructor(scene, camera = null) {
    this.scene = scene;
    this.camera = camera || scene.cameras.main;

    this.trauma = 0.0;
    this.traumaDecay = JuiceConfig.camera.traumaDecay;
    this.traumaPower = JuiceConfig.camera.traumaPower;
    this.maxOffsetX = JuiceConfig.camera.maxOffsetX;
    this.maxOffsetY = JuiceConfig.camera.maxOffsetY;
    this.maxRoll = JuiceConfig.camera.maxRoll;
    this.frequency = JuiceConfig.camera.frequency;

    this.timeAccumulator = 0.0;
    this.baseScrollX = this.camera.scrollX;
    this.baseScrollY = this.camera.scrollY;
    this.baseRotation = this.camera.rotation;

    this.offsetX = 0.0;
    this.offsetY = 0.0;
    this.offsetRoll = 0.0;

    // Register update event
    this.scene.events.on('update', this.update, this);
    this.scene.events.once('shutdown', this.destroy, this);
  }

  /**
   * Add trauma (0.0 to 1.0)
   * @param {number} amount
   */
  addTrauma(amount) {
    this.trauma = Phaser.Math.Clamp(this.trauma + amount, 0.0, 1.0);
  }

  /**
   * Set trauma directly
   * @param {number} amount
   */
  setTrauma(amount) {
    this.trauma = Phaser.Math.Clamp(amount, 0.0, 1.0);
  }

  /**
   * Quick shake preset trigger
   * @param {'light'|'medium'|'heavy'|number} strength
   */
  shake(strength = 'medium') {
    if (typeof strength === 'number') {
      this.addTrauma(strength);
      return;
    }

    switch (strength) {
      case 'light':
        this.addTrauma(JuiceConfig.camera.lightShakeTrauma);
        break;
      case 'heavy':
        this.addTrauma(JuiceConfig.camera.heavyShakeTrauma);
        break;
      case 'medium':
      default:
        this.addTrauma(JuiceConfig.camera.mediumShakeTrauma);
        break;
    }
  }

  /**
   * Pseudo-random coherent harmonic generator for natural organic shake
   * @param {number} seed
   * @param {number} time
   */
  getHarmonicNoise(seed, time) {
    return (
      Math.sin(time * this.frequency + seed) * 0.6 +
      Math.sin(time * this.frequency * 1.7 + seed * 2.3) * 0.3 +
      Math.sin(time * this.frequency * 3.1 + seed * 4.7) * 0.1
    );
  }

  /**
   * Per-frame camera trauma decay and shake calculation
   * @param {number} time
   * @param {number} delta - Delta time in ms
   */
  update(time, delta) {
    const dt = delta / 1000.0;
    this.timeAccumulator += dt;

    if (this.trauma > 0) {
      // Decay trauma
      this.trauma = Math.max(0.0, this.trauma - this.traumaDecay * dt);

      // Shake power calculation: power = trauma^2 (or trauma^3)
      const shakePower = Math.pow(this.trauma, this.traumaPower);

      // Calculate translational and rotational offsets
      const noiseX = this.getHarmonicNoise(10.0, this.timeAccumulator);
      const noiseY = this.getHarmonicNoise(20.0, this.timeAccumulator);
      const noiseRoll = this.getHarmonicNoise(30.0, this.timeAccumulator);

      this.offsetX = this.maxOffsetX * shakePower * noiseX;
      this.offsetY = this.maxOffsetY * shakePower * noiseY;
      this.offsetRoll = this.maxRoll * shakePower * noiseRoll;

      // Apply to camera scroll and rotation
      this.camera.setScroll(this.baseScrollX + this.offsetX, this.baseScrollY + this.offsetY);
      this.camera.setRotation(this.baseRotation + this.offsetRoll);
    } else {
      if (this.offsetX !== 0 || this.offsetY !== 0 || this.offsetRoll !== 0) {
        this.offsetX = 0;
        this.offsetY = 0;
        this.offsetRoll = 0;
        this.camera.setScroll(this.baseScrollX, this.baseScrollY);
        this.camera.setRotation(this.baseRotation);
      }
    }
  }

  /**
   * Clean up event listeners on camera/scene destroy
   */
  destroy() {
    if (this.scene && this.scene.events) {
      this.scene.events.off('update', this.update, this);
    }
  }
}

export default ShakeCamera2D;
