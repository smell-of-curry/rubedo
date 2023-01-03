import { Player } from "@minecraft/server";
import { FORBIDDEN_ITEMS } from "../../config/moderation.js";
import { AIR } from "../../../../index.js";
import { getConfigId, getMaxEnchantmentLevel } from "../../utils";
import { Ban } from "../models/Ban.js";
import { Log } from "../models/Log.js";
import { PlayerLog } from "../models/PlayerLog.js";
import { Protection } from "../models/Protection.js";

/**
 * Stores violation count for player
 */
const ViolationCount = new PlayerLog<number>();

/**
 * Flags a player for a item they should not have
 * @param player player to flag
 * @param index the index of this item in the players inventory
 */
function flag(player: Player, index: number) {
  const inventory = player.getComponent("inventory").container;
  const item = inventory.getItem(index);
  const data = getConfigId("cbe_config");
  // Clear Item
  if (data.clearItem) inventory.setItem(index, AIR);
  // Log action
  new Log({
    playerName: player.name,
    message: `${player.name} Has obtained a unobtainable item: ${item.typeId}`,
    protection: "unobtainable",
  });
  // Violation
  if (!data.banPlayer) return;
  const violations = (ViolationCount.get(player) ?? 0) + 1;
  ViolationCount.set(player, violations);
  if (violations < data.violationCount) return;
  new Ban(player, null, "Possession of Unobtainable item");
}

new Protection(
  "unobtainable",
  "Blocks unobtainable items",
  "textures/blocks/end_portal.png",
  true
).forEachValidPlayer((player) => {
  console.warn(`unobtainable`);
  const BANNED_ITEMS = getConfigId("banned_items");

  const inventory = player.getComponent("inventory").container;
  for (let i = 0; i < inventory.size; i++) {
    const item = inventory.getItem(i);
    if (!item) continue;
    if (BANNED_ITEMS.includes(item.typeId)) return flag(player, i);
    if (FORBIDDEN_ITEMS.includes(item.typeId)) {
      // Log action
      new Log({
        playerName: player.name,
        message: `${player.name} Has obtained a Forbidden item: ${item.typeId}`,
        protection: "unobtainable",
      });
      return inventory.setItem(i, AIR);
    }
    // Player is allowed to have this itemType
    /**
     * List of all enchantments that are valid on this item
     */
    let enchantments: string[] = [];
    for (const enchantment of item.getComponent("enchantments").enchantments) {
      const MAX_LEVEL = getMaxEnchantmentLevel(enchantment);
      if (enchantment.level > MAX_LEVEL) return flag(player, i);
      if (enchantment.level < 1) return flag(player, i);
      if (enchantments.includes(enchantment.type.id)) return flag(player, i);
      // Enchantment Is valid
      enchantments.push(enchantment.type.id);
    }
  }
});
