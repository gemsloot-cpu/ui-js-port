/**
 * JuiceConfig - Global Juice and Animation Configuration
 * Ported from Godot 4 Resource assets/juice_config.tres
 */
export const JuiceConfig = {
  // Camera Shake & Trauma settings
  camera: {
    maxOffsetX: 24.0,
    maxOffsetY: 24.0,
    maxRoll: 0.075, // Radians
    traumaPower: 2.0, // Trauma exponent (trauma^2)
    traumaDecay: 1.25, // Decay rate per second
    frequency: 30.0, // Shake frequency oscillation
    lightShakeTrauma: 0.35,
    mediumShakeTrauma: 0.65,
    heavyShakeTrauma: 1.0
  },

  // Time Manipulation / Hit Stop
  time: {
    hitStopDefaultMs: 80,
    hitStopHeavyMs: 160,
    hitStopFreezeScale: 0.001,
    slowMotionScale: 0.25,
    slowMotionDefaultMs: 1200,
    fastMotionScale: 2.0
  },

  // Hit Flash Feedback
  flash: {
    duration: 100, // Milliseconds
    defaultColor: 0xffffff,
    critColor: 0xffe066,
    defaultAlpha: 0.9,
    ease: 'Linear'
  },

  // Floating Damage Numbers
  damageNumbers: {
    duration: 900,
    fadeDelay: 450,
    gravity: 420,
    velXMin: -60,
    velXMax: 60,
    velYMin: -240,
    velYMax: -300,
    normalScale: 1.0,
    critScale: 1.45,
    healScale: 1.15,
    shieldScale: 1.1,
    fontSizeNormal: '18px',
    fontSizeCrit: '26px',
    fontSizeHeal: '20px',
    colors: {
      normal: '#ffffff',
      crit: '#ffd166',
      heal: '#06d6a0',
      shield: '#4cc9f0',
      outline: '#111122'
    }
  },

  // Button Interaction & Tactile Juice
  button: {
    hoverScale: 1.05,
    pressScale: 0.92,
    hoverLiftY: -2,
    squishDuration: 80,
    releaseDuration: 180,
    hoverDuration: 100,
    easeIn: 'Quad.easeOut',
    easeOut: 'Back.easeOut',
    elasticOut: 'Elastic.easeOut'
  },

  // Progress / Dual-Fill Bars
  bar: {
    fillDuration: 250,
    ghostDelay: 300,
    ghostDuration: 450,
    flashOnDamage: true,
    ease: 'Quad.easeOut',
    ghostEase: 'Quad.easeInOut'
  },

  // Numeric Counter Rolling
  counter: {
    rollDuration: 500,
    punchScale: 1.25,
    punchDuration: 160,
    ease: 'Quad.easeOut'
  },

  // Toast Notification Stack
  toast: {
    slideDuration: 300,
    displayDuration: 3200,
    fadeDuration: 250,
    spacing: 14,
    slideEase: 'Back.easeOut',
    fadeEase: 'Quad.easeIn',
    cardWidth: 320,
    cardHeight: 64
  },

  // Modal Menu Dialog
  menu: {
    openDuration: 320,
    closeDuration: 220,
    openEase: 'Back.easeOut',
    closeEase: 'Back.easeIn',
    backdropAlpha: 0.75
  },

  // CRT Post-Processing Filter
  crt: {
    enabled: false,
    curvature: 0.1,
    scanlines: 0.28,
    vignette: 0.35,
    rgbShift: 0.0025,
    brightness: 1.05
  }
};

export default JuiceConfig;
