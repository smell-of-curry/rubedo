/**
 * The leeway that the distances can be off before it flags
 */
export const MOVEMENT_DISTANCE_THRESHOLD = 0.80;

/**
 * Constant of speeds when players are moving
 */
export const MOVEMENT_CONSTANTS = {
  walk: {
    velocity: 0.17 as const,
    distance: 0.23 as const,
  },
  run: {
    velocity: 0.19 as const,
    distance: 0.35 as const,
  },
};

/**
 * The distance increase per speed effect increase
 */
export const SPEED_EFFECT_INCREASE = 0.056;

/**
 * if the distance is over this amount the system will automatically flag tp
 */
export const ANTI_TP_DISTANCE_THRESHOLD = 10;

/**
 * If your 
 */
export const TAGS = ["gliding", "riding"];
