import { Entity, ItemStack, Location, Player } from "@minecraft/server";
import type { ChestGUI } from "./Models/EntityChest";
import type { Page } from "./Models/Page";

/**
 * This will link a players name to a chest gui instance
 */
export const CHESTGUIS: { [key: string]: ChestGUI } = {};

/**
 * This will link a players name to a chest gui instance
 */
export const PAGES: { [key: string]: Page } = {};

/**
 * Gets a players held item
 */
export function getHeldItem(player: Player): ItemStack {
  const inventory = player.getComponent("minecraft:inventory").container;
  return inventory.getItem(player.selectedSlot);
}

/**
 * Clears the player of a item in there pointer slot
 */
export async function clearPlayersPointer(
  player: Player,
  ItemToClear: ItemStack
) {
  try {
    const inventory = player.getComponent("minecraft:inventory").container;
    let itemsToLoad = [];
    for (let i = 0; i < inventory.size; i++) {
      const item = inventory.getItem(i);
      if (!item) continue;
      if (item?.typeId == ItemToClear?.typeId) {
        itemsToLoad.push({ slot: i, item: item });
        inventory.setItem;
        if (i < 9) {
          player.runCommandAsync(`replaceitem entity @s slot.hotbar ${i} air`);
        } else {
          player.runCommandAsync(
            `replaceitem entity @s slot.inventory ${i - 9} air`
          );
        }
      }
    }
    await player.runCommandAsync(
      `clear @s ${ItemToClear?.typeId} ${ItemToClear.data} ${ItemToClear.amount}`
    );
    for (const item of itemsToLoad) {
      inventory.setItem(item.slot, item.item);
    }
  } catch (error) {
    // the item couldn't be cleared that means
    // they now have a item witch is really BAD
    [
      ...player.dimension.getEntities({
        type: "minecraft:item",
        location: new Location(
          player.location.x,
          player.location.y,
          player.location.z
        ),
        maxDistance: 2,
        closest: 1,
      }),
    ].forEach((e) => e.kill());
  }
}

/**
 * Gets an item at slot
 */
export function getItemAtSlot(entity: Entity, slot: number): ItemStack | null {
  const inventory = entity.getComponent("minecraft:inventory").container;
  return inventory.getItem(slot);
}
