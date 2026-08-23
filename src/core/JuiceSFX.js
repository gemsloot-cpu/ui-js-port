/**
 * JuiceSFX - Dynamic Sound Player with Pitch & Volume Randomization
 * Ported from Godot 4 scripts/core/juice_sfx.gd
 */
import Phaser from 'phaser';
import { SFXBank } from './SFXBank.js';
import { SfxLibrary } from '../config/SfxLibrary.js';

export class JuiceSFX {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.sfxBank = new SFXBank(scene);
    this.masterVolume = 1.0;
    this.sfxVolume = 1.0;
    this.muted = false;

    // Cooldown tracker to prevent audio clutter
    this.lastPlayTime = new Map();
    this.cooldownMs = 30;
  }

  /**
   * Play a sound from a bank (or direct key) with pitch & volume randomization
   * @param {string} bankOrKey - e.g. 'click', 'confirm', 'hit_heavy', or 'sfx_click_001'
   * @param {Object} [options]
   * @returns {Phaser.Sound.BaseSound|null}
   */
  play(bankOrKey, options = {}) {
    if (this.muted || !this.scene || !this.scene.sound) return null;

    const now = performance.now();
    const lastTime = this.lastPlayTime.get(bankOrKey) || 0;
    if (now - lastTime < this.cooldownMs && !options.force) {
      return null;
    }
    this.lastPlayTime.set(bankOrKey, now);

    let audioKey = bankOrKey;
    let baseVolume = options.volume ?? 1.0;
    let pitchRange = options.pitchRange ?? SfxLibrary.defaultPitchRange;

    // Check if bank exists
    const bank = this.sfxBank.getBank(bankOrKey);
    if (bank) {
      audioKey = this.sfxBank.getRandomKey(bankOrKey);
      baseVolume = (options.volume ?? 1.0) * bank.volume;
      pitchRange = options.pitchRange ?? bank.pitchRange;
    }

    if (!audioKey || !this.scene.cache.audio.has(audioKey)) {
      // Audio not cached or sound not found
      return null;
    }

    // Pitch randomization: rate between pitchRange[0] and pitchRange[1] (0.9 to 1.1)
    const minRate = pitchRange[0] ?? 0.92;
    const maxRate = pitchRange[1] ?? 1.08;
    const rate = options.rate ?? Phaser.Math.FloatBetween(minRate, maxRate);

    // Volume randomization: +/- 5% variance
    const volVariance = Phaser.Math.FloatBetween(0.95, 1.05);
    const finalVolume = Phaser.Math.Clamp(
      baseVolume * this.masterVolume * this.sfxVolume * volVariance,
      0.0,
      1.0
    );

    try {
      const soundConfig = {
        volume: finalVolume,
        rate: rate,
        detune: options.detune ?? 0,
        loop: options.loop ?? false
      };

      return this.scene.sound.play(audioKey, soundConfig);
    } catch (e) {
      console.warn('JuiceSFX: playback error', e);
      return null;
    }
  }

  /**
   * Helper shortcuts for common sounds
   */
  click(options) { return this.play('click', options); }
  confirm(options) { return this.play('confirm', options); }
  error(options) { return this.play('error', options); }
  explode(options) { return this.play('explode', options); }
  footstep(options) { return this.play('footstep', options); }
  hitHeavy(options) { return this.play('hit_heavy', options); }
  hitLight(options) { return this.play('hit_light', options); }
  hitMetal(options) { return this.play('hit_metal', options); }
  pickup(options) { return this.play('pickup', options); }

  setVolume(volume) {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0.0, 1.0);
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
  }
}

export default JuiceSFX;
