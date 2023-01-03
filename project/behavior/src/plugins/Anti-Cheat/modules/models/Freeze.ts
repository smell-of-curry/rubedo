import { Player } from "@minecraft/server";
import { TABLES } from "../../../../database/tables.js";
import type { IFreezeData } from "../../../../types.js";

export class Freeze {
  /**
   * Freeze a player
   */
  constructor(player: Player, reason: string = "No Reason") {
    const data: IFreezeData = {
      playerName: player.name,
      key: player.id,
      reason: reason,
      location: {
        x: player.location.x,
        y: player.location.y,
        z: player.location.z,
        dimension: player.dimension.id,
      },
    };
    TABLES.freezes.set(player.id, data);
  }
}
