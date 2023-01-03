import {
  world,
  Location,
  Block,
  BlockPermutation,
  Dimension,
  Player,
  system,
} from "@minecraft/server";
import { API_CONTAINERS } from "../../plugins/Anti-Cheat/config/moderation";
import { CONTAINER_LOCATIONS } from "../../plugins/Anti-Cheat/modules/managers/containers.js";

type beforeBlockBreakCallback = (arg0: BeforeBlockBreakEvent) => void;

const CALLBACKS: {
  [key: number]: {
    callback: beforeBlockBreakCallback;
  };
} = {};

world.events.blockBreak.subscribe((data) => {
  for (const callback of Object.values(CALLBACKS)) {
    callback.callback(
      new BeforeBlockBreakEvent(
        data.block,
        data.brokenBlockPermutation,
        data.dimension,
        data.player
      )
    );
  }
});

export class beforeBlockBreak {
  /**
   * Subscribes to a callback to get notified when a chat is sent that is not a command
   * @param callback what to be called when one of these entities inventory's changes
   * @returns the id that is used to unsubscribe
   */
  static subscribe(callback: beforeBlockBreakCallback): number {
    const key = Date.now();
    CALLBACKS[key] = { callback: callback };
    return key;
  }
  static unsubscribe(key: number): void {
    delete CALLBACKS[key];
  }
}

class BeforeBlockBreakEvent {
  /**
   * Contains information regarding an event before a player breaks a block.
   * @param block Block broken in this event. Note that because this event fires right after a block is broken, the block you will receive will likely be of type 'minecraft:air'. See the .brokenBlockPermutation property for information on this block before it was broken.
   * @param brokenBlockPermutation Returns permutation information about this block before it was broken.
   * @param dimension Dimension that contains the block that has been broken in this event.
   * @param player Player that broke the block for this event.
   */
  constructor(
    public block: Block,
    public brokenBlockPermutation: BlockPermutation,
    public dimension: Dimension,
    public player: Player
  ) {
    this.block = block;
    this.brokenBlockPermutation = brokenBlockPermutation;
    this.dimension = dimension;
    this.player = player;
  }

  set cancel(value: boolean) {
    // setting block back
    this.dimension
      .getBlock(this.block.location)
      .setPermutation(this.brokenBlockPermutation.clone());
    // setting chest inventory back
    if (API_CONTAINERS.includes(this.brokenBlockPermutation.type.id)) {
      const OLD_INVENTORY =
        CONTAINER_LOCATIONS[JSON.stringify(this.block.location)];
      if (OLD_INVENTORY) {
        OLD_INVENTORY.load(this.block.getComponent("inventory").container);
      }
    }
    // killing dropped items
    system.run(() => {
      [
        ...this.dimension.getEntities({
          maxDistance: 2,
          type: "minecraft:item",
          location: new Location(
            this.block.location.x,
            this.block.location.y,
            this.block.location.z
          ),
        }),
      ].forEach((e) => e.kill());
    })
  }
}
