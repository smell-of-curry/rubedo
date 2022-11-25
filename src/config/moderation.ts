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
  MinecraftItemTypes.commandBlockMinecart.id,
  MinecraftItemTypes.commandBlock.id,
  MinecraftItemTypes.repeatingCommandBlock.id,
  MinecraftItemTypes.chainCommandBlock.id,
  MinecraftItemTypes.structureBlock.id,
  MinecraftItemTypes.structureVoid.id,

  // Not Normal Items (Not in survival)
  MinecraftItemTypes.bedrock.id,

  MinecraftItemTypes.endPortalFrame.id,

  // spawn eggs (will need to be updated when new mobs are added)
  "minecraft:spawn_egg",
  "minecraft:chicken_spawn_egg",
  "minecraft:bee_spawn_egg",
  "minecraft:cow_spawn_egg",
  "minecraft:pig_spawn_egg",
  "minecraft:sheep_spawn_egg",
  "minecraft:wolf_spawn_egg",
  "minecraft:polar_bear_spawn_egg",
  "minecraft:ocelot_spawn_egg",
  "minecraft:cat_spawn_egg",
  "minecraft:mooshroom_spawn_egg",
  "minecraft:bat_spawn_egg",
  "minecraft:parrot_spawn_egg",
  "minecraft:rabbit_spawn_egg",
  "minecraft:llama_spawn_egg",
  "minecraft:horse_spawn_egg",
  "minecraft:donkey_spawn_egg",
  "minecraft:chicken_spawn_egg",
  "minecraft:mule_spawn_egg",
  "minecraft:skeleton_horse_spawn_egg",
  "minecraft:zombie_horse_spawn_egg",
  "minecraft:tropical_fish_spawn_egg",
  "minecraft:cod_spawn_egg",
  "minecraft:pufferfish_spawn_egg",
  "minecraft:salmon_spawn_egg",
  "minecraft:dolphin_spawn_egg",
  "minecraft:sea_turtle_spawn_egg",
  "minecraft:panda_spawn_egg",
  "minecraft:fox_spawn_egg",
  "minecraft:creeper_spawn_egg",
  "minecraft:enderman_spawn_egg",
  "minecraft:silverfish_spawn_egg",
  "minecraft:skeleton_spawn_egg",
  "minecraft:wither_spawn_egg",
  "minecraft:stray_spawn_egg",
  "minecraft:slime_spawn_egg",
  "minecraft:spider_spawn_egg",
  "minecraft:zombie_spawn_egg",
  "minecraft:zombified_piglin_spawn_egg",
  "minecraft:husk_spawn_egg",
  "minecraft:drowned_spawn_egg",
  "minecraft:squid_spawn_egg",
  "minecraft:glow_squid_spawn_egg",
  "minecraft:cave_spider_spawn_egg",
  "minecraft:witch_spawn_egg",
  "minecraft:guardian_spawn_egg",
  "minecraft:elder_guardian_spawn_egg",
  "minecraft:endermite_spawn_egg",
  "minecraft:magma_cube_spawn_egg",
  "minecraft:strider_spawn_egg",
  "minecraft:hoglin_spawn_egg",
  "minecraft:piglin_spawn_egg",
  "minecraft:zoglin_spawn_egg",
  "minecraft:piglin_brute_spawn_egg",
  "minecraft:goat_spawn_egg",
  "minecraft:axolotl_spawn_egg",
  "minecraft:ghast_spawn_egg",
  "minecraft:blaze_spawn_egg",
  "minecraft:shulker_spawn_egg",
  "minecraft:vindicator_spawn_egg",
  "minecraft:evoker_spawn_egg",
  "minecraft:vex_spawn_egg",
  "minecraft:villager_spawn_egg",
  "minecraft:wandering_trader_spawn_egg",
  "minecraft:zombie_villager_spawn_egg",
  "minecraft:phantom_spawn_egg",
  "minecraft:pillager_spawn_egg",
  "minecraft:ravager_spawn_egg",
  "minecraft:allay_spawn_egg",
  "minecraft:tadpole_spawn_egg",
  "minecraft:frog_spawn_egg",
  "minecraft:warden_spawn_egg",

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
  MinecraftBlockTypes.beehive.id,
  MinecraftBlockTypes.beeNest.id,
  MinecraftBlockTypes.dispenser.id,
];

/**
 * List of blocks that cannot be placed down
 */
export const BANNED_BLOCKS = [
  // Should Not be Placed
  MinecraftBlockTypes.mobSpawner.id,
  MinecraftBlockTypes.bedrock.id,
  MinecraftBlockTypes.barrier.id,
  "minecraft:invisiblebedrock",
  "minecraft:movingBlock",
  "minecraft:movingblock",
  "minecraft:moving_block",
];

/**
 * A List of all containers a item could be in
 * @note only blocks that are supported by script api
 */
export const BLOCK_CONTAINERS = [
  "minecraft:chest",
  "minecraft:trapped_chest",
  //"minecraft:barrel",
  //"minecraft:dispenser",
  //"minecraft:dropper",
  //"minecraft:furnace",
  //"minecraft:blast_furnace",
  //"minecraft:lit_furnace",
  //"minecraft:lit_blast_furnace",
  //"minecraft:hopper",
  //"minecraft:shulker_box",
  //"minecraft:undyed_shulker_box",
  // "minecraft:lit_smoker",
  // "minecraft:smoker",
];

/**
 * The block size to check for blockContainers
 */
export const CHECK_SIZE = { x: 7, y: 7, z: 7 };
