import { BlockInventoryComponentContainer, ItemStack } from "@minecraft/server";

export class BlockInventory {
  emptySlotsCount: number;
  size: number;
  items: Array<ItemStack>;
  /**
   * Coverts a blockInventoryComponentContainer and saves it
   * @param {BlockInventoryComponentContainer} inventory
   */
  constructor(inventory: BlockInventoryComponentContainer) {
    this.emptySlotsCount = inventory.emptySlotsCount;
    this.size = inventory.size;
    this.items = [];
    for (let i = 0; i < this.size; i++) {
      this.items[i] = inventory.getItem(i);
    }
  }

  /**
   * Loads this inventory onto a BlockInventoryComponentContainer
   * @param {BlockInventoryComponentContainer} block block to load on
   */
  load(block: BlockInventoryComponentContainer) {
    for (let i = 0; i < block.size; i++) {
      if (!this.items[i]) continue;
      block.setItem(i, this.items[i]);
    }
  }
}
