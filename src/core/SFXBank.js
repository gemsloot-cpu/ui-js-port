/**
 * SFXBank - Sound Bank Container and Registry
 * Ported from Godot 4 scripts/core/sfx_bank.gd
 */
import { SfxLibrary } from '../config/SfxLibrary.js';

export class SFXBank {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.banks = new Map();

    this.initBanks();
  }

  initBanks() {
    for (const [bankName, data] of Object.entries(SfxLibrary.banks)) {
      const keys = data.files.map(file => {
        // Derive audio key from filename: 'audio/sfx/click/click_001.ogg' -> 'sfx_click_001'
        const parts = file.split('/');
        const filename = parts[parts.length - 1].replace('.ogg', '');
        return `sfx_${filename}`;
      });

      this.banks.set(bankName, {
        name: bankName,
        keys,
        volume: data.volume ?? 1.0,
        pitchRange: data.pitchRange ?? SfxLibrary.defaultPitchRange
      });
    }
  }

  /**
   * Get bank data by name
   * @param {string} bankName
   */
  getBank(bankName) {
    return this.banks.get(bankName) || null;
  }

  /**
   * Get a random sound key from a bank
   * @param {string} bankName
   */
  getRandomKey(bankName) {
    const bank = this.getBank(bankName);
    if (!bank || bank.keys.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * bank.keys.length);
    return bank.keys[randomIndex];
  }

  /**
   * Get all registered bank names
   */
  getBankNames() {
    return Array.from(this.banks.keys());
  }
}

export default SFXBank;
