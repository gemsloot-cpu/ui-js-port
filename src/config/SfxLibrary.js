/**
 * SfxLibrary - Sound Library Configuration & Audio Metadata
 * Ported from Godot 4 Resource assets/sfx_library.tres
 */
export const SfxLibrary = {
  defaultPitchRange: [0.92, 1.08],
  defaultVolumeRange: [0.95, 1.05],

  // Sound Banks Grouping
  banks: {
    click: {
      volume: 0.85,
      pitchRange: [0.94, 1.06],
      files: [
        'audio/sfx/click/click_001.ogg',
        'audio/sfx/click/click_002.ogg',
        'audio/sfx/click/click_003.ogg',
        'audio/sfx/click/click_004.ogg'
      ]
    },
    confirm: {
      volume: 0.9,
      pitchRange: [0.96, 1.04],
      files: [
        'audio/sfx/confirm/confirmation_001.ogg',
        'audio/sfx/confirm/confirmation_002.ogg',
        'audio/sfx/confirm/confirmation_003.ogg'
      ]
    },
    error: {
      volume: 0.95,
      pitchRange: [0.95, 1.05],
      files: [
        'audio/sfx/error/error_001.ogg',
        'audio/sfx/error/error_002.ogg',
        'audio/sfx/error/error_003.ogg'
      ]
    },
    explode: {
      volume: 1.0,
      pitchRange: [0.88, 1.12],
      files: [
        'audio/sfx/explode/impactPlate_heavy_000.ogg',
        'audio/sfx/explode/impactPlate_heavy_001.ogg',
        'audio/sfx/explode/impactPlate_heavy_002.ogg',
        'audio/sfx/explode/impactPlate_heavy_003.ogg'
      ]
    },
    footstep: {
      volume: 0.65,
      pitchRange: [0.9, 1.1],
      files: [
        'audio/sfx/footstep/footstep_concrete_000.ogg',
        'audio/sfx/footstep/footstep_concrete_001.ogg',
        'audio/sfx/footstep/footstep_concrete_002.ogg',
        'audio/sfx/footstep/footstep_concrete_003.ogg'
      ]
    },
    hit_heavy: {
      volume: 1.0,
      pitchRange: [0.88, 1.1],
      files: [
        'audio/sfx/hit_heavy/impactPunch_heavy_000.ogg',
        'audio/sfx/hit_heavy/impactPunch_heavy_001.ogg',
        'audio/sfx/hit_heavy/impactPunch_heavy_002.ogg',
        'audio/sfx/hit_heavy/impactPunch_heavy_003.ogg'
      ]
    },
    hit_light: {
      volume: 0.8,
      pitchRange: [0.92, 1.08],
      files: [
        'audio/sfx/hit_light/impactGeneric_light_000.ogg',
        'audio/sfx/hit_light/impactGeneric_light_001.ogg',
        'audio/sfx/hit_light/impactGeneric_light_002.ogg',
        'audio/sfx/hit_light/impactGeneric_light_003.ogg'
      ]
    },
    hit_metal: {
      volume: 0.85,
      pitchRange: [0.94, 1.06],
      files: [
        'audio/sfx/hit_metal/impactMetal_medium_000.ogg',
        'audio/sfx/hit_metal/impactMetal_medium_001.ogg',
        'audio/sfx/hit_metal/impactMetal_medium_002.ogg',
        'audio/sfx/hit_metal/impactMetal_medium_003.ogg'
      ]
    },
    pickup: {
      volume: 0.9,
      pitchRange: [0.95, 1.05],
      files: [
        'audio/sfx/pickup/pluck_001.ogg',
        'audio/sfx/pickup/pluck_002.ogg'
      ]
    }
  }
};

export default SfxLibrary;
