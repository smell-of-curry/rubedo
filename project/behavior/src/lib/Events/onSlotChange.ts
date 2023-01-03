import {
  Entity,
  EntityQueryOptions,
  ItemStack,
  PlayerInventoryComponentContainer,
  system,
} from "@minecraft/server";
import { DIMENSIONS } from "../../utils.js";

type onSlotChangeCallback = (entity: Entity, change: ISlotChangeReturn) => void;

const CALLBACKS: {
  [key: number]: {
    callback: onSlotChangeCallback;
    entities: EntityQueryOptions;
  };
} = {};

const MAPPED_INVENTORIES: { [key: string]: Array<IMappedInventoryItem> } = {};
export const PREVIOUS_CHANGE: { [key: string]: ISlotChangeReturn } = {};

export interface ISlotChangeReturn {
  /**
   * Slot that changed
   */
  slot: number;
  /**
   * The uid of this item
   */
  uid: string;
  /**
   * The old uid of this item
   */
  oldUid?: string;
  /**
   * the item that was grabbed / put
   */
  item: ItemStack;
  /**
   * The old itemStack that was in this slot
   */
  oldItem?: ItemStack;
  /**
   * How the inventory has changed
   */
  changeType: "delete" | "put" | "swap" | "fluctuation" | "move";
}

interface IMappedInventoryItem {
  /**
   * a unique id for a itemStack
   */
  uid: string;
  /**
   * the item
   */
  item: ItemStack;
}

/**
 * Finds and returns a slot change in a inventory
 */
function getSlotChanges(
  entity: Entity,
  oldInv: Array<IMappedInventoryItem>,
  newInv: Array<IMappedInventoryItem>
): Array<ISlotChangeReturn> {
  if (oldInv.length != newInv.length) return [];
  const changes: Array<ISlotChangeReturn> = [];
  for (let i = 0; i < newInv.length; i++) {
    if (
      oldInv[i]?.item?.amount < newInv[i]?.item?.amount ||
      (oldInv[i]?.item?.amount > newInv[i]?.item?.amount &&
        oldInv[i]?.item?.amount != 0)
    ) {
      // Checks if the item is the same but checks if the amount has changed
      const change_data: ISlotChangeReturn = {
        slot: i,
        uid: newInv[i].uid,
        oldUid: oldInv[i].uid,
        item: newInv[i].item,
        oldItem: oldInv[i].item,
        changeType: "fluctuation",
      };
      changes.push(change_data);
      PREVIOUS_CHANGE[entity.id] = change_data;
      continue;
    }
    if (newInv[i].uid == oldInv[i].uid) continue; // no change
    if (oldInv[i]?.item && newInv[i]?.item) {
      // Checks if there was a new item but a new slot was not taken up
      // Meaning that the item got used like using a bucket on a cow
      const change_data: ISlotChangeReturn = {
        slot: i,
        uid: newInv[i].uid,
        oldUid: oldInv[i].uid,
        item: newInv[i].item,
        oldItem: oldInv[i].item,
        changeType: "swap",
      };
      changes.push(change_data);
      PREVIOUS_CHANGE[entity.id] = change_data;
    } else if (!newInv[i]?.item) {
      // There is no more item in this slot
      // Meaning the item has been moved across slots or been thrown out
      const change_data: ISlotChangeReturn = {
        slot: i,
        uid: oldInv[i].uid,
        item: oldInv[i].item,
        changeType: "delete",
      };
      changes.push(change_data);
      PREVIOUS_CHANGE[entity.id] = change_data;
    } else if (newInv[i]?.item) {
      // New item has been added in this slot
      if (
        PREVIOUS_CHANGE[entity.id]?.changeType == "delete" &&
        PREVIOUS_CHANGE[entity.id]?.uid == newInv[i].uid
      ) {
        // item has been moved across slots
        const change_data: ISlotChangeReturn = {
          slot: i,
          uid: newInv[i].uid,
          item: newInv[i].item,
          changeType: "move",
        };
        changes.push(change_data);
        PREVIOUS_CHANGE[entity.id] = change_data;
        continue;
      } else {
        const change_data: ISlotChangeReturn = {
          slot: i,
          uid: newInv[i].uid,
          item: newInv[i].item,
          changeType: "put",
        };
        changes.push(change_data);
        PREVIOUS_CHANGE[entity.id] = change_data;
      }
    }
  }
  return changes;
}

/**
  * Converts a itemStack to a unique id
  * @param {ItemStack} item
  * @returns {string}
  */
export function getItemUid(item: ItemStack): string {
  if (!item) return "";
  const data = [];
  data.push(item.typeId);
  data.push(item.nameTag);
  data.push(item.data);
  data.push(item.getLore().join(""));
  return data.join("");
}

/**
 * Gets an entity's inventory but with mapped data
 */
function mapInventory(
  container: PlayerInventoryComponentContainer
): Array<IMappedInventoryItem> {
  const inventory = [];

  for (let i = 0; i < container.size; i++) {
    let item = container.getItem(i);
    inventory[i] = {
      uid: getItemUid(item),
      item: item,
    };
  }
  return inventory;
}

system.runSchedule(() => {
  for (const callback of Object.values(CALLBACKS)) {
    for (const entity of DIMENSIONS.overworld.getEntities(callback.entities)) {
      const inventory = mapInventory(
        entity.getComponent("inventory").container
      );
      const changes = getSlotChanges(
        entity,
        MAPPED_INVENTORIES[entity.id] ?? inventory,
        inventory
      );
      MAPPED_INVENTORIES[entity.id] = inventory;
      if (changes.length == 0) continue;
      if (entity.hasTag("skipCheck")) {
        entity.removeTag("skipCheck");
        delete PREVIOUS_CHANGE[entity.id];
        continue;
      }
      for (const change of changes) {
        callback.callback(entity, change);
      }
    }
  }
}, 5);

export class onEntityInventorySlotChange {
  /**
   * Subscribes to a callback to get notified when a entities inventory changes
   * @param callback what to be called when one of these entities inventory's changes
   * @param entities the entity's to grab from
   * @returns the id that is used to unsubscribe
   */
  static subscribe(
    entities: EntityQueryOptions,
    callback: onSlotChangeCallback
  ): number {
    const key = Date.now();
    CALLBACKS[key] = { callback: callback, entities: entities };
    return key;
  }
  static unsubscribe(key: number): void {
    delete CALLBACKS[key];
  }
}
