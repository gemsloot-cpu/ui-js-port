/**
 * ScreenFX - Fullscreen Visual Effects & CRT Post-Processing
 * Ported from Godot 4 scripts/core/screen_fx.gd
 */
import Phaser from 'phaser';
import { CrtPostFXPipeline } from '../shaders/CrtPostFXPipeline.js';

export class ScreenFX {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.crtPipeline = null;
    this.flashRect = null;

    this.initFlashOverlay();
    this.initCrtShader();
  }

  initFlashOverlay() {
    const { width, height } = this.scene.scale;
    this.flashRect = this.scene.add.rectangle(width / 2, height / 2, width * 2, height * 2, 0xffffff, 0);
    this.flashRect.setScrollFactor(0);
    this.flashRect.setDepth(9999);
    this.flashRect.setVisible(false);

    // Keep flash rect sized on resize
    this.scene.scale.on('resize', (gameSize) => {
      if (this.flashRect) {
        this.flashRect.setPosition(gameSize.width / 2, gameSize.height / 2);
        this.flashRect.setSize(gameSize.width * 2, gameSize.height * 2);
      }
    });
  }

  initCrtShader() {
    if (this.scene.renderer && this.scene.renderer.type === Phaser.WEBGL && this.scene.cameras && this.scene.cameras.main) {
      try {
        const camera = this.scene.cameras.main;
        if (typeof camera.setPostPipeline === 'function') {
          camera.setPostPipeline(CrtPostFXPipeline);
          this.crtPipeline = camera.getPostPipeline(CrtPostFXPipeline) || 
                             camera.getPostPipeline('CrtPostFXPipeline') ||
                             (camera.postPipelines && camera.postPipelines[0]) || null;
        }
        if (this.crtPipeline && typeof this.crtPipeline.setEnabled === 'function') {
          this.crtPipeline.setEnabled(false); // Disabled by default, toggleable in demo
        }
      } catch (err) {
        console.warn('ScreenFX: Could not initialize CRT post pipeline', err);
        this.crtPipeline = null;
      }
    }
  }

  /**
   * Trigger a fullscreen colored flash (e.g. explosion, huge hit, or victory)
   * @param {number} [color=0xffffff]
   * @param {number} [maxAlpha=0.6]
   * @param {number} [duration=250]
   */
  flash(color = 0xffffff, maxAlpha = 0.6, duration = 250) {
    if (!this.flashRect) return;

    this.flashRect.fillColor = color;
    this.flashRect.fillAlpha = maxAlpha;
    this.flashRect.setVisible(true);

    this.scene.tweens.killTweensOf(this.flashRect);
    this.scene.tweens.add({
      targets: this.flashRect,
      fillAlpha: 0,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (this.flashRect) {
          this.flashRect.setVisible(false);
        }
      }
    });
  }

  /**
   * Toggle CRT shader on/off
   */
  toggleCRT() {
    if (!this.crtPipeline && this.scene && this.scene.cameras && this.scene.cameras.main) {
      const camera = this.scene.cameras.main;
      this.crtPipeline = camera.getPostPipeline(CrtPostFXPipeline) || camera.getPostPipeline('CrtPostFXPipeline') || null;
    }

    if (this.crtPipeline && typeof this.crtPipeline.toggle === 'function') {
      return this.crtPipeline.toggle();
    } else if (this.crtPipeline && typeof this.crtPipeline.setEnabled === 'function') {
      const newState = !this.crtPipeline.enabled;
      this.crtPipeline.setEnabled(newState);
      return newState;
    }
    return false;
  }

  /**
   * Enable/disable CRT shader
   * @param {boolean} enabled
   */
  setCRTEnabled(enabled) {
    if (!this.crtPipeline && this.scene && this.scene.cameras && this.scene.cameras.main) {
      const camera = this.scene.cameras.main;
      this.crtPipeline = camera.getPostPipeline(CrtPostFXPipeline) || camera.getPostPipeline('CrtPostFXPipeline') || null;
    }

    if (this.crtPipeline && typeof this.crtPipeline.setEnabled === 'function') {
      this.crtPipeline.setEnabled(enabled);
      return this.crtPipeline.enabled;
    }
    return false;
  }

  isCRTEnabled() {
    return this.crtPipeline ? Boolean(this.crtPipeline.enabled) : false;
  }

  /**
   * Update CRT shader parameters
   */
  setCRTParams(params = {}) {
    if (!this.crtPipeline && this.scene && this.scene.cameras && this.scene.cameras.main) {
      const camera = this.scene.cameras.main;
      this.crtPipeline = camera.getPostPipeline(CrtPostFXPipeline) || camera.getPostPipeline('CrtPostFXPipeline') || null;
    }
    if (!this.crtPipeline) return;

    if (params.scanlines !== undefined && typeof this.crtPipeline.setScanlines === 'function') {
      this.crtPipeline.setScanlines(params.scanlines);
    }
    if (params.curvature !== undefined && typeof this.crtPipeline.setCurvature === 'function') {
      this.crtPipeline.setCurvature(params.curvature);
    }
    if (params.vignette !== undefined && typeof this.crtPipeline.setVignette === 'function') {
      this.crtPipeline.setVignette(params.vignette);
    }
    if (params.rgbShift !== undefined && typeof this.crtPipeline.setRgbShift === 'function') {
      this.crtPipeline.setRgbShift(params.rgbShift);
    }
  }

  destroy() {
    if (this.flashRect) {
      this.flashRect.destroy();
    }
  }
}

export default ScreenFX;
