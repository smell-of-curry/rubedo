import { world, Player } from "@minecraft/server";
import { FORBIDDEN_BLOCKS } from "../../config/moderation";
import { Npc } from "../models/Npc";
import { getConfigId, getRole } from "../../utils";
import { Ban } from "../models/Ban";

/**
 * Enttiies that are not allowed to spawn because they can be used by CBE
 */
const CBE_ENTITIES = ["minecraft:command_block_minecart"];

world.events.entityCreate.subscribe(({ entity }) => {
  if (entity.typeId != "minecraft:npc") return;
  const kill = () => {
    try {
      entity.triggerEvent("despawn");
      entity.kill();
    } catch (error) {
      entity.kill();
    }
  };
  if (CBE_ENTITIES.includes(entity.typeId)) return kill();
  if (entity.typeId == "minecraft:npc" && !Npc.isVaild(entity)) return kill();
});

world.events.beforeItemUseOn.subscribe((data) => {
  if (!(data.source instanceof Player)) return;
  if (["moderator", "admin"].includes(getRole(data.source))) return;
  if (FORBIDDEN_BLOCKS.includes(data.item.typeId)) {
    data.cancel = true;
    return;
  }
  const BANNED_BLOCKS = getConfigId("banned_blocks");
  if (!BANNED_BLOCKS.includes(data.item.typeId)) return;
  data.cancel = true;
  new Ban(data.source, null, "Placing Banned Blocks");
});

world.events.blockPlace.subscribe(({ player, block }) => {
  if (!["minecraft:chest", "minecraft:trapped_chest"].includes(block.typeId))
    return;
  const container = block.getComponent("inventory")?.container;
  if (!container) return;
  let bannedItems = getConfigId("banned_items");
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (!item) continue;
    if (!bannedItems.includes(item.typeId)) continue;
    block.dimension.runCommandAsync(
      `setblock ${block.x} ${block.y} ${block.z} air`
    );
    new Ban(player, null, "Placing Chest with Banned Items");
    return;
  }
});
