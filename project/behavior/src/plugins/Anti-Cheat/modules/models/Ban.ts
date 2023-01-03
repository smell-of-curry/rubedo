import { Player } from "@minecraft/server";
import { TABLES } from "../../../../database/tables.js";
import type { IBanData } from "../../../../types.js";
import { durationToMs } from "../../../../utils.js";

function setBan(
  player: string | Player,
  id: string,
  duration?: string,
  reason: string = "No Reason",
  by: string = "Rubedo Auto Mod"
) {
  const data: IBanData = {
    key: id,
    playerName: player instanceof Player ? player.name : player,
    date: Date.now(),
    duration: duration ? durationToMs(duration) : null,
    expire: duration ? durationToMs(duration) + Date.now() : null,
    reason: reason,
    by: by,
  };
  TABLES.bans.set(id, data);
}

export class Ban {
  /**
   * Ban a player for a set length
   */
  constructor(
    player: string | Player,
    duration?: string,
    reason: string = "No Reason",
    by: string = "Rubedo Auto Mod"
  ) {
    if (player instanceof Player) {
      setBan(player, player.id, duration, reason, by);
    } else {
      setBan(player, TABLES.ids.get(player), duration, reason, by);
    }
  }
}
