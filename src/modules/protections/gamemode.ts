import { GameMode, world } from "@minecraft/server";
import { setTickInterval } from "../../lib/Scheduling/utils.js";
import { getConfigId, getRole } from "../../utils.js";
import { Ban } from "../models/Ban.js";
import { PlayerLog } from "../models/PlayerLog.js";

/**
 * The gamemode that you cannot be in unless you have staff tag
 */
const ILLEGLE_GAMEMODE = GameMode.creative;

/**
 * Stores per world load violation data for players
 */
const ViolationCount = new PlayerLog<number>();

setTickInterval(() => {
  const gamemode_config = getConfigId("gamemode_config");
  for (const player of world.getPlayers({ gameMode: ILLEGLE_GAMEMODE })) {
    if (["moderator", "admin", "builder"].includes(getRole(player))) continue;
    try {
      if (gamemode_config.setToSurvival) player.runCommand(`gamemode s`);
      if (gamemode_config.clearPlayer) player.runCommand(`clear @s`);
    } catch (error) {}
    const count = (ViolationCount.get(player) ?? 0) + 1;
    ViolationCount.set(player, count);
    if (gamemode_config.banPlayer && count >= gamemode_config.violationCount)
      new Ban(player, null, "Illegal Gamemode");
  }
}, 20);
