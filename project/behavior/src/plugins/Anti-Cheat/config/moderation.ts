import { MinecraftBlockTypes, MinecraftItemTypes } from "@minecraft/server";

/**
 * Items that simply get removed from inventory but will not ban
 */
export const FORBIDDEN_ITEMS = [
  // Common CBE Items
  MinecraftItemTypes.beehive.id,
  MinecraftItemTypes.beeNest.id,
  MinecraftItemTypes.axolotlBucket.id,
  MinecraftItemTypes.codBucket.id,
  MinecraftItemTypes.tadpoleBucket.id,
  MinecraftItemTypes.tropicalFishBucket.id,
  MinecraftItemTypes.salmonBucket.id,
  MinecraftItemTypes.pufferfishBucket.id,
];

/**
 * List of items that if you hold you will be automatically banned
 */
export const BANNED_ITEMS = [
  // Op Only Items
  MinecraftItemTypes.allow.id,
  MinecraftItemTypes.barrier.id,
  MinecraftItemTypes.borderBlock.id,
  MinecraftItemTypes.debugStick?.id ?? "minecraft:debug_stick",
  MinecraftItemTypes.deny.id,
  MinecraftItemTypes.jigsaw.id,
  MinecraftItemTypes.lightBlock.id,
  MinecraftItemTypes.commandBlock.id,
  MinecraftItemTypes.repeatingCommandBlock.id,
  MinecraftItemTypes.chainCommandBlock.id,
  MinecraftItemTypes.commandBlockMinecart.id,
  MinecraftItemTypes.structureBlock.id,
  MinecraftItemTypes.structureVoid.id,

  // Not Normal Items
  MinecraftItemTypes.bedrock.id,
  MinecraftItemTypes.endPortalFrame.id,

  // Server Movement Blocks
  "minecraft:info_update",
  "minecraft:info_update2",
  "minecraft:reserved3",
  "minecraft:reserved4",
  "minecraft:reserved6",
  "minecraft:movingBlock",
  "minecraft:moving_block",
  "minecraft:movingblock",
  "minecraft:piston_arm_collision",
  "minecraft:piston_arm_collision",
  "minecraft:pistonarmcollision",
  "minecraft:stickyPistonArmCollision",
  "minecraft:sticky_piston_arm_collision",
  "minecraft:unknown",

  // Common Hacked Items
  "minecraft:glowingobsidian",
  "minecraft:invisible_bedrock",
  "minecraft:invisiblebedrock",
  "minecraft:netherreactor",
  "minecraft:portal",
  "minecraft:fire",
  "minecraft:water",
  "minecraft:lava",
  "minecraft:flowing_lava",
  "minecraft:flowing_water",
  "minecraft:soul_fire",
];

/**
 * Blocks in this list are forbidden from being placed but will not ban the placer
 */
export const FORBIDDEN_BLOCKS = [
  // Common CBE Blocks
  MinecraftBlockTypes.dispenser.id,
];

/**
 * List of blocks that cannot be placed down
 */
export const BANNED_BLOCKS = [
  // Should Not be Placed
  MinecraftBlockTypes.bedrock.id,
  MinecraftBlockTypes.barrier.id,
  "minecraft:invisiblebedrock",
  "minecraft:movingBlock",
  "minecraft:movingblock",
  "minecraft:moving_block",
];

/**
 * The currently supported block containers by script api
 */
export const API_CONTAINERS = [
  MinecraftBlockTypes.chest.id,
  MinecraftBlockTypes.trappedChest.id,
];

/**
 * A List of containers
 */
export const CONTAINERS = [
  MinecraftItemTypes.chest.id,
  MinecraftItemTypes.trappedChest.id,
  MinecraftItemTypes.barrel.id,
  MinecraftItemTypes.dispenser.id,
  MinecraftItemTypes.dropper.id,
  MinecraftItemTypes.furnace.id,
  "minecraft:lit_furnace",
  MinecraftItemTypes.blastFurnace.id,
  "minecraft:lit_blast_furnace",
  MinecraftItemTypes.smoker.id,
  "minecraft:lit_smoker",
  MinecraftItemTypes.hopper.id,
  MinecraftItemTypes.shulkerBox.id,
  MinecraftItemTypes.undyedShulkerBox.id,
];

/**
 * The block size to check for blockContainers
 */
export const CHECK_SIZE = { x: 7, y: 7, z: 7 };
