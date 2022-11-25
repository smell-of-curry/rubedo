import { Location, Player, world } from "@minecraft/server";
import { PlayerLog } from "../../modules/models/PlayerLog";

type onPlayerMoveCallback = (player: Player) => void;

const CALLBACKS: {
  [key: number]: {
    callback: onPlayerMoveCallback;
  };
} = {};

/**
 * Stores Last Previous grounded location
 */
export const playerLocation = new PlayerLog<Location>();

world.events.tick.subscribe((data) => {
  const sendCallback = (player: Player) => {
    for (const callback of Object.values(CALLBACKS)) {
      callback.callback(player);
    }
  };
  for (const player of world.getPlayers()) {
    const oldLocation = playerLocation.get(player);
    if (oldLocation && player.location.equals(oldLocation)) continue;
    playerLocation.set(player, player.location);
    sendCallback(player);
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
}
