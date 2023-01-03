import { Player } from "@minecraft/server";
import { TABLES } from "../../../../database/tables.js";
import type { IMuteData } from "../../../../types.js";
import { durationToMs } from "../../../../utils.js";

export class Mute {
  length: number;
  /**
   * Gets the mute data for this player
   */
  static getMuteData(player: Player): IMuteData {
    return TABLES.mutes.get(player.name);
  }
  /**
   * Mutes a player for a length
   */
  constructor(
    player: Player,
    duration?: string,
    reason: string = "No Reason",
    by: string = "Rubedo Auto Mod"
  ) {
    const msLength = duration ? durationToMs(duration) : null;
    const data: IMuteData = {
      playerName: player.name,
      date: Date.now(),
      duration: msLength,
      expire: msLength ? msLength + Date.now() : null,
      reason: reason,
      by: by,
    };
    TABLES.mutes.set(player.name, data);
  }
}
