import { PlayerLog } from "../models/PlayerLog.js";
import { getRole } from "../../utils.js";
import { Ban } from "../models/Ban.js";
import { beforeBlockBreak } from "../../../../lib/Events/beforeBlockBreak.js";
import { Protection } from "../models/Protection.js";

/**
 * The log of the players break times
 */
const log = new PlayerLog();

/**
 * if a block is broken faster than this time it is considered hacking
 */
const IMPOSSIBLE_BREAK_TIME = 15;

/**
 * When breaking vegetation blocks it could cause a false trigger
 * so when a block gets broken and it has one of the block tags
 * it gets skipped and doesn't count in the nuker event
 *
 * @link https://wiki.bedrock.dev/blocks/block-tags.html
 */
const VALID_BLOCK_TAGS = [
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

let beforeBlockBreakKey: number = null;

const protection = new Protection<{
  banPlayer: boolean;
  violationCount: number;
}>(
  "nuker",
  "Blocks block breaking too fast",
  "textures/blocks/dirt.png",
  true
).setConfigDefault({
  banPlayer: {
    description: "If the player should be banned once violation count is met",
    defaultValue: false,
  },
  violationCount: {
    description: "Violations before ban",
    defaultValue: 0,
  },
});

protection
  .onEnable(() => {
    const config = protection.getConfig();
    beforeBlockBreakKey = beforeBlockBreak.subscribe((data) => {
      if (["moderator", "admin"].includes(getRole(data.player))) return;
      if (data.block.getTags().some((tag) => VALID_BLOCK_TAGS.includes(tag)))
        return;
      const old = log.get(data.player);
      log.set(data.player, Date.now());
      if (!old) return;

      // If block is impossible to break skip check, reduces lag.
      if (!IMPOSSIBLE_BREAKS.includes(data.block.typeId)) {
        if (old < Date.now() - IMPOSSIBLE_BREAK_TIME) return;
        const count = (ViolationCount.get(data.player) ?? 0) + 1;
        ViolationCount.set(data.player, count);
        if (config.banPlayer && count >= config.violationCount)
          new Ban(data.player, null, "Using Nuker");
      }

      data.cancel = true;
    });
  })
  .onDisable(() => {
    beforeBlockBreak.unsubscribe(beforeBlockBreakKey);
  });
