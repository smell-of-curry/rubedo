import { system, world } from "@minecraft/server";
import { API_CONTAINERS, CHECK_SIZE } from "../../config/moderation";
import { IContainerLocation } from "../../../../types";
import { vector3ToBlockLocation } from "../../../../utils.js";
import { BlockInventory } from "../models/BlockInventory";

/**
 * storage of all container locations in the world
 */
export let CONTAINER_LOCATIONS: IContainerLocation = {};

system.runSchedule(() => {
  CONTAINER_LOCATIONS = {};
  for (const player of world.getPlayers()) {
    if (player.dimension.id != "minecraft:overworld") continue;
    const blockLoc = vector3ToBlockLocation(player.location);
    const pos1 = blockLoc.offset(CHECK_SIZE.x, CHECK_SIZE.y, CHECK_SIZE.z);
    const pos2 = blockLoc.offset(-CHECK_SIZE.x, -CHECK_SIZE.y, -CHECK_SIZE.z);

    for (const location of pos1.blocksBetween(pos2)) {
      if (location.y < -64) continue;
      const block = player.dimension.getBlock(location);
      if (!block) continue;
      if (!API_CONTAINERS.includes(block.typeId)) continue;
      CONTAINER_LOCATIONS[JSON.stringify(location)] = new BlockInventory(
        block.getComponent("inventory").container
      );
    }
  }
}, 100);
