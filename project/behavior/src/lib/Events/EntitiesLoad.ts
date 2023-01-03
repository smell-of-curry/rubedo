import { system, world } from "@minecraft/server";
import { DIMENSIONS } from "../../utils";

const CALLBACKS: {
  [key: number]: () => void;
} = {};

/**
 * If the world is loaded or not
 */
export let ENTITIES_LOADED = false;

system.run(async () => {
  try {
    await DIMENSIONS.overworld.runCommandAsync(`testfor @a`);
    ENTITIES_LOADED = true;
    for (const [i, callback] of Object.entries(CALLBACKS)) {
      callback();
      delete CALLBACKS[i as unknown as number];
    }
  } catch (error) {
    let e = world.events.entityCreate.subscribe((data) => {
      system.run(() => {
        ENTITIES_LOADED = true;
        for (const [i, callback] of Object.entries(CALLBACKS)) {
          callback();
          delete CALLBACKS[i as unknown as number];
        }
        world.events.entityCreate.unsubscribe(e);
      });
    });
  }
});

export class EntitiesLoad {
  static async awaitLoad(): Promise<void> {
    if (ENTITIES_LOADED) return;
    return new Promise((resolve) => {
      EntitiesLoad.subscribe(resolve);
    });
  }
  static subscribe(callback: () => void): number {
    if (ENTITIES_LOADED) {
      callback();
      return;
    }
    const key = Object.keys(CALLBACKS).length;
    CALLBACKS[key] = callback;
    return key;
  }

  static unsubscribe(key: number): void {
    delete CALLBACKS[key];
  }
}
