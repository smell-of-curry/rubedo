import { Player, MinecraftBlockTypes } from "@minecraft/server";
import { FORBIDDEN_BLOCKS } from "../../config/moderation";
import { Npc } from "../models/Npc";
import { getConfigId, getRole } from "../../utils";
import { Ban } from "../models/Ban";
import { Protection } from "../models/Protection";

/**
 * Entities that are not allowed to spawn because they can be used by CBE
 */
const CBE_ENTITIES = ["minecraft:command_block_minecart"];

const protection = new Protection<{
  entityCreate: boolean;
  banSpawnEggs: boolean;
}>(
  "cbe",
  "Stops CBE",
  "textures/blocks/command_block.png",
  true
).setConfigDefault({
  entityCreate: {
    description: "Adds NPC protection",
    defaultValue: true,
  },
  banSpawnEggs: {
    description: "If spawn eggs should be banned",
    defaultValue: true,
  },
});

protection.subscribe("entityCreate", ({ entity }) => {
  const config = protection.getConfig();
  if (!config.entityCreate) return;
  const kill = () => {
    try {
      entity.triggerEvent("despawn");
      entity.kill();
    } catch (error) {
      entity.kill();
    }
  };
  if (CBE_ENTITIES.includes(entity.typeId)) return kill();
  if (entity.typeId == "minecraft:npc" && !Npc.isValid(entity)) return kill();
});

protection.subscribe("beforeItemUseOn", (data) => {
  if (!(data.source instanceof Player)) return;
  if (["admin", "moderator"].includes(getRole(data.source))) return;
  const config = protection.getConfig();

  if (data.item.typeId.endsWith("spawn_egg")) {
    if (!config.banSpawnEggs) return;
    const block = data.source.dimension.getBlock(data.blockLocation);
    if (block.typeId == MinecraftBlockTypes.mobSpawner.id) return;
    // Cancel use so players cant use spawnEggs on floor
    data.cancel = true;
    data.source.tell(`§c[Rubedo]: You cannot place spawnEggs on the floor!`);
    data.source.playSound(`note.bass`);
  } else {
    if (FORBIDDEN_BLOCKS.includes(data.item.typeId)) {
      data.cancel = true;
      return;
    }
    const BANNED_BLOCKS = getConfigId("banned_blocks");
    if (!BANNED_BLOCKS.includes(data.item.typeId)) return;
    data.cancel = true;
    new Ban(data.source, null, "Placing Banned Blocks");
  }
});
