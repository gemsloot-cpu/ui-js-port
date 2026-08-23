/**
 * CrtPostFXPipeline - Phaser 3 PostFX Pipeline for Fullscreen CRT Effects
 * Converted from Godot 4 shader assets/shaders/crt.gdshader
 */
import Phaser from 'phaser';

const fragShader = `
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uMainSampler;
uniform vec2 uResolution;
uniform float uTime;

uniform float uCurvature;
uniform float uScanlines;
uniform float uVignette;
uniform float uRgbShift;
uniform float uBrightness;
uniform float uEnabled;

varying vec2 outTexCoord;

// Lens distortion / barrel curve function
vec2 curveUV(vec2 uv, float curveAmount) {
    if (curveAmount <= 0.0) return uv;
    vec2 centered = uv * 2.0 - 1.0;
    vec2 offset = abs(centered.yx) / vec2(6.0 / curveAmount, 4.0 / curveAmount);
    centered = centered + centered * offset * offset;
    return centered * 0.5 + 0.5;
}

void main(void) {
    if (uEnabled < 0.5) {
        gl_FragColor = texture2D(uMainSampler, outTexCoord);
        return;
    }

    vec2 uv = curveUV(outTexCoord, uCurvature);

    // Outside boundary check for curved screen
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    // Chromatic Aberration / RGB Split
    vec2 shift = vec2(uRgbShift, 0.0);
    float r = texture2D(uMainSampler, uv + shift).r;
    float g = texture2D(uMainSampler, uv).g;
    float b = texture2D(uMainSampler, uv - shift).b;
    float a = texture2D(uMainSampler, uv).a;
    vec3 color = vec3(r, g, b);

    // Scanlines
    float scanlineCount = uResolution.y * 0.5;
    float scanline = sin(uv.y * scanlineCount * 3.14159265 + uTime * 3.0);
    scanline = (scanline + 1.0) * 0.5;
    color = color - color * (scanline * uScanlines);

    // Vignette
    vec2 vigUV = uv * (1.0 - uv);
    float vignette = vigUV.x * vigUV.y * 15.0;
    vignette = clamp(pow(vignette, uVignette), 0.0, 1.0);
    color *= vignette;

    // Brightness adjustment
    color *= uBrightness;

    gl_FragColor = vec4(color, a);
}
`;

export class CrtPostFXPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: 'CrtPostFXPipeline',
      fragShader
    });

    this.customTime = 0.0;
    this.curvature = 0.12;
    this.scanlines = 0.25;
    this.vignette = 0.35;
    this.rgbShift = 0.0025;
    this.brightness = 1.05;
    this.enabled = true;
  }

  onPreRender() {
    this.customTime += 0.016;

    this.set2f('uResolution', this.renderer.width, this.renderer.height);
    this.set1f('uTime', this.customTime);
    this.set1f('uCurvature', this.curvature);
    this.set1f('uScanlines', this.scanlines);
    this.set1f('uVignette', this.vignette);
    this.set1f('uRgbShift', this.rgbShift);
    this.set1f('uBrightness', this.brightness);
    this.set1f('uEnabled', this.enabled ? 1.0 : 0.0);
  }

  setEnabled(val) {
    this.enabled = Boolean(val);
    return this;
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setScanlines(val) {
    this.scanlines = Phaser.Math.Clamp(val, 0.0, 1.0);
    return this;
  }

  setCurvature(val) {
    this.curvature = Phaser.Math.Clamp(val, 0.0, 0.5);
    return this;
  }

  setRgbShift(val) {
    this.rgbShift = Phaser.Math.Clamp(val, 0.0, 0.02);
    return this;
  }

  setVignette(val) {
    this.vignette = Phaser.Math.Clamp(val, 0.0, 1.0);
    return this;
  }
}

export default CrtPostFXPipeline;
