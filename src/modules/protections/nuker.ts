import { world, Location } from "@minecraft/server";
import { setTickTimeout } from "../../lib/Scheduling/utils.js";
import { BLOCK_CONTAINERS } from "../../config/moderation";
import { PlayerLog } from "../models/PlayerLog.js";
import { getConfigId, getRole } from "../../utils.js";
import { CONTAINER_LOCATIONS } from "../managers/containers.js";
import { Ban } from "../models/Ban.js";

/**
 * Minecraft Bedrock Anti Nuker
 * @license MIT
 * @author Smell of curry
 * @version 1.0.0
 * --------------------------------------------------------------------------
 * This anti nuker works by loging everytime a player breaks a block
 * Then the next time they break a block it tests the time from now to then
 * And if they broke a block in 50 miliseconds than we place that block back
 * --------------------------------------------------------------------------
 */

/**
 * The log of the players break times
 */
const log = new PlayerLog();

/**
 * if a block is broken faster than this time it is considered hacking
 */
const IMPOSSIBLE_BREAK_TIME = 70;

/**
 * When breaking vegitation blocks it could cause a false trigger
 * so when a block gets broken and it has one of the block tags
 * it gets skipped and doesnt count in the nuker event
 *
 * @link https://wiki.bedrock.dev/blocks/block-tags.html
 */
const VAILD_BLOCK_TAGS = [
  "snow",
  "lush_plants_replaceable",
  "azalea_log_replaceable",
  "minecraft:crop",
  "fertilize_area",
];

/**
 * A list of all the blocks that are impossible to break unless you have hacks
 */
const IMPOSSIBLE_BREAKS = [
  "minecraft:water",
  "minecraft:flowing_water",
  "minecraft:lava",
  "minecraft:flowing_lava",
  "minecraft:bedrock",
];

/**
 * Stores per world load violation data for players
 */
const ViolationCount = new PlayerLog<number>();

world.events.blockBreak.subscribe(
  ({ block, brokenBlockPermutation, dimension, player }) => {
    if (["moderator", "admin"].includes(getRole(player))) return;
    if (block.getTags().some((tag) => VAILD_BLOCK_TAGS.includes(tag))) return;
    const old = log.get(player);
    log.set(player, Date.now());
    if (!old) return;

    if (IMPOSSIBLE_BREAKS.includes(block.typeId)) return;
    if (old < Date.now() - IMPOSSIBLE_BREAK_TIME) return;
    const nuker_data = getConfigId("nuker_data");
    const count = (ViolationCount.get(player) ?? 0) + 1;
    ViolationCount.set(player, count);
    if (nuker_data.banPlayer && count >= nuker_data.violationCount)
      new Ban(player, null, "Nuker detected");

    // setting block back
    dimension
      .getBlock(block.location)
      .setPermutation(brokenBlockPermutation.clone());
    // setting chest inventory back
    if (BLOCK_CONTAINERS.includes(brokenBlockPermutation.type.id)) {
      const OLD_INVENTORY = CONTAINER_LOCATIONS[JSON.stringify(block.location)];
      if (OLD_INVENTORY) {
        OLD_INVENTORY.load(block.getComponent("inventory").container);
      }
    }
    // killing dropped items
    setTickTimeout(() => {
      [
        ...dimension.getEntities({
          maxDistance: 2,
          type: "minecraft:item",
          location: new Location(
            block.location.x,
            block.location.y,
            block.location.z
          ),
        }),
      ].forEach((e) => e.kill());
    }, 0);
  }
);
