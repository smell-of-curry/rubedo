import { BlockLocation, Player, system, world } from "@minecraft/server";
import { Region } from "../models/Region.js";
import { forEachValidPlayer, getRole, loadRegionDenys } from "../../utils.js";
import { BLOCK_CONTAINERS, DOORS_SWITCHES } from "../../config/region.js";
import { DIMENSIONS } from "../../../../utils.js";
import { EntitiesLoad } from "../../../../lib/Events/EntitiesLoad.js";

/**
 * Sets Deny blocks at bottom of region every 5 mins
 */
system.runSchedule(() => {
  loadRegionDenys();
}, 6000);

/**
 * Permissions for region
 */
world.events.beforeItemUseOn.subscribe((data) => {
  if (["moderator", "admin"].includes(getRole(data.source as Player))) return;
  const region = Region.blockLocationInRegion(
    data.blockLocation,
    data.source.dimension.id
  );
  if (!region) return;
  const block = data.source.dimension.getBlock(data.blockLocation);
  if (
    DOORS_SWITCHES.includes(block.typeId) &&
    region.permissions.doorsAndSwitches
  )
    return;
  if (
    BLOCK_CONTAINERS.includes(block.typeId) &&
    region.permissions.openContainers
  )
    return;
  data.cancel = true;
});

world.events.beforeExplosion.subscribe((data) => {
  for (let i = 0; i < data.impactedBlocks.length; i++) {
    const bL = data.impactedBlocks[i];
    let region = Region.blockLocationInRegion(bL, data.dimension.id);
    if (region) return (data.cancel = true);
  }
});

world.events.entityCreate.subscribe(async ({ entity }) => {
  const region = await Region.blockLocationInRegionSync(
    new BlockLocation(entity.location.x, entity.location.y, entity.location.z),
    entity.dimension.id
  );
  if (!region) return;
  if (region.permissions.allowedEntities.includes(entity.typeId)) return;
  entity.teleport({ x: 0, y: -64, z: 0 }, entity.dimension, 0, 0);
  entity.kill();
});

EntitiesLoad.subscribe(() => {
  system.runSchedule(async () => {
    for (const region of await Region.getAllRegionsSync()) {
      for (const entity of DIMENSIONS[
        region.dimensionId as keyof typeof DIMENSIONS
      ].getEntities({ excludeTypes: region.permissions.allowedEntities })) {
        if (!region.entityInRegion(entity)) continue;
        entity.teleport({ x: 0, y: -64, z: 0 }, entity.dimension, 0, 0);
        entity.kill();
      }
    }
  }, 100);
});

/**
 * Gives player a tag if they are in a region
 */
forEachValidPlayer((player) => {
  for (const region of Region.getAllRegions()) {
    if (region.entityInRegion(player)) {
      player.addTag(`inRegion`);
      if (!region.permissions.pvp) player.addTag(`region-protected`);
    } else {
      player.removeTag(`inRegion`);
      player.removeTag(`region-protected`);
    }
  }
}, 5);
