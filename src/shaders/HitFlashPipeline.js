/**
 * HitFlashPipeline - Phaser 3 PostFX Pipeline for Sprite/Container Hit Flash
 * Converted from Godot 4 shader assets/shaders/hit_flash.gdshader
 */
import Phaser from 'phaser';

const fragShader = `
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uMainSampler;
uniform vec4 uFlashColor;
uniform float uFlashAmount;

varying vec2 outTexCoord;

void main(void) {
    vec4 textureColor = texture2D(uMainSampler, outTexCoord);
    
    // Mix the original texture color with the solid flash color based on flash amount
    vec3 mixedRgb = mix(textureColor.rgb, uFlashColor.rgb * textureColor.a, uFlashAmount);
    
    gl_FragColor = vec4(mixedRgb, textureColor.a);
}
`;

export class HitFlashPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: 'HitFlashPipeline',
      fragShader
    });

    this.flashAmount = 0.0;
    this.flashColor = [1.0, 1.0, 1.0, 1.0]; // RGBA [0..1]
  }

  onPreRender() {
    this.setShaderUniforms();
  }

  onDraw(renderTarget) {
    this.setShaderUniforms();
    this.bindAndDraw(renderTarget);
  }

  setShaderUniforms() {
    this.set1f('uFlashAmount', this.flashAmount);
    this.set4f(
      'uFlashColor',
      this.flashColor[0],
      this.flashColor[1],
      this.flashColor[2],
      this.flashColor[3]
    );
  }

  /**
   * Set flash intensity (0.0 to 1.0)
   * @param {number} amount
   */
  setAmount(amount) {
    this.flashAmount = Phaser.Math.Clamp(amount, 0.0, 1.0);
    return this;
  }

  /**
   * Set flash color as RGB/RGBA float array or Hex
   * @param {number|number[]} color - 0xffffff or [r, g, b, a]
   */
  setColor(color) {
    if (Array.isArray(color)) {
      this.flashColor = color;
    } else if (typeof color === 'number') {
      const r = ((color >> 16) & 0xff) / 255.0;
      const g = ((color >> 8) & 0xff) / 255.0;
      const b = (color & 0xff) / 255.0;
      this.flashColor = [r, g, b, 1.0];
    }
    return this;
  }

  /**
   * Trigger a flash animation on the host gameObject
   * @param {Phaser.Scene} scene
   * @param {number} [duration=120] - duration in ms
   * @param {number} [color=0xffffff] - flash color
   * @param {Function} [onComplete]
   */
  flash(scene, duration = 120, color = 0xffffff, onComplete = null) {
    this.setColor(color);
    this.setAmount(1.0);

    scene.tweens.add({
      targets: this,
      flashAmount: 0.0,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });
  }
}

export default HitFlashPipeline;
