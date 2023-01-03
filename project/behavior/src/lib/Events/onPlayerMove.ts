import { Dimension, Player, system, Vector3, world } from "@minecraft/server";
import { PlayerLog } from "../../plugins/Anti-Cheat/modules/models/PlayerLog";

type onPlayerMoveCallback = (player: Player, data: ILocationLog) => void;

const CALLBACKS: {
  [key: number]: {
    callback: onPlayerMoveCallback;
  };
} = {};

export interface ILocationLog {
  /**
   * The Location this is
   */
  location: Vector3;
  /**
   * The dimension this location was in
   */
  dimension: Dimension;
}

/**
 * Checks if two vectors are the same
 * @param from first vector
 * @param to second vector
 */
function vector3Equals(from: Vector3, to: Vector3): boolean {
  if (from.x != to.x) return false;
  if (from.y != to.y) return false;
  if (from.z != to.z) return false;
  return true;
}

/**
 * Stores Last Previous grounded location
 */
export const playerLocation = new PlayerLog<ILocationLog>();

system.runSchedule(() => {
  const sendCallback = (player: Player, data: ILocationLog) => {
    for (const callback of Object.values(CALLBACKS)) {
      callback.callback(player, data);
    }
  };
  for (const player of world.getPlayers()) {
    const oldLocation = playerLocation.get(player);
    if (oldLocation) {
      if (vector3Equals(player.location, oldLocation.location)) {
        continue;
      }
    }
    playerLocation.set(player, {
      location: player.location,
      dimension: player.dimension,
    });
    if (!oldLocation) continue;
    sendCallback(player, oldLocation);
  }
});

export class onPlayerMove {
  /**
   * Subscribes to a callback to get notified when a player moves
   * @param callback what to be called when one of these entity's inventory changes
   * @returns the id that is used to unsubscribe
   */
  static subscribe(callback: onPlayerMoveCallback): number {
    const key = Date.now();
    CALLBACKS[key] = { callback: callback };
    return key;
  }
  static unsubscribe(key: number): void {
    delete CALLBACKS[key];
  }
  /**
   * Clears a players location
   * @param player player to clear
   */
  static delete(player: Player): void {
    playerLocation.delete(player);
  }
}
