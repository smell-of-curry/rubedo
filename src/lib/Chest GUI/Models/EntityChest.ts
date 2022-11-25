import { Entity, Player, world } from "@minecraft/server";
import { AIR } from "../../../index.js";
import { ENTITY_INVENTORY } from "../../../config/chest";
import {
  ISlotChangeReturn,
  onEntityInventorySlotChange,
} from "../../Events/onSlotChange";
import {
  CHESTGUIS,
  CHEST_OPEN,
  clearPlayersPointer,
  getItemAtSlot,
  PAGES,
} from "../utils.js";
import { ItemGrabbedCallback } from "./ItemGrabbedCallback";
import { ISlot, Page } from "./Page.js";

export class ChestGUI {
  /**
   * The connected player to this gui
   */
  player: Player;
  /**
   * The entity that this chest gui is associated to
   */
  entity: Entity;
  /**
   * The event that is registered on this gui
   */
  tickEvent: any;

  /**
   * The page that this gui is currently viewing
   */
  page: Page;

  /**
   * The event that is used to test for changes in inventory
   */
  slotChangeEvent: number;

  /**
   * if the player has a chest open
   */
  hasChestOpen: boolean;

  /**
   * Spawns a entity to be attached to the player
   * @param player player this entity will be attached to
   */
  static spawnEntity(player: Player): Entity {
    try {
      return player.dimension.spawnEntity(
        ENTITY_INVENTORY,
        player.headLocation
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Links a new chest gui to a player
   * @param player player to link
   */
  constructor(player: Player) {
    this.player = player;
    this.entity = ChestGUI.spawnEntity(player);
    if (this.entity) {
      this.hasChestOpen = false;
      this.setPage("home");
    }
    this.tickEvent = world.events.tick.subscribe(() => {
      if (!this.entity) return this.despawn();
      if (CHEST_OPEN.get(this.player)) {
        if (!this.hasChestOpen) {
          // Player has this inventory open run checks for changes
          this.slotChangeEvent = onEntityInventorySlotChange.subscribe(
            { type: ENTITY_INVENTORY },
            (entity, change) => {
              if (entity.id != this.entity.id) return;
              this.onSlotChange(change);
            }
          );
        }
        this.hasChestOpen = true;
      } else {
        // Player does not have inventory open but item is held
        try {
          this.entity.teleport(
            this.player.headLocation,
            this.player.dimension,
            this.player.rotation.x,
            this.player.rotation.y,
            true
          );
        } catch (error) {
          this.despawn();
        }
      }
    });
  }

  /**
   * Sets this gui to a page of items
   * @param pageId page to set this gui too
   */
  setPage(pageId: string, extras?: any) {
    const c = this.entity.getComponent("inventory").container;
    for (let i = 0; i < c.size; i++) {
      c.setItem(i, AIR);
    }
    if (!Object.keys(PAGES).includes(pageId))
      throw new Error(`pageId ${pageId} does not exist!`);
    const page = PAGES[pageId];
    this.page = page;

    page.fillType(this.entity, page, extras);
    this.entity.nameTag = `size:54`;
  }

  /**
   * This runs when a slot gets changed in the chest inventory
   */
  onSlotChange(change: ISlotChangeReturn) {
    /**
     * The guiItem that was changed
     */
    const slot: ISlot = this.page.slots[change.slot];

    if (!slot) {
      // item was added to page that is not a valid slot so set that slot back to air
      this.entity.getComponent("inventory").container.setItem(change.slot, AIR);
    } else if (change.changeType == "delete") {
      // item was taken from this page
      if (slot.item) clearPlayersPointer(this.player, change.item);
      /**
       * if the slot has a item that returns when something is grabbed, this checks
       * if there is a item put into the slot to return, if not it will not send a
       * callback by returning before
       */
      if (!slot.item && !getItemAtSlot(this.entity, change.slot)) return;
      slot.action(new ItemGrabbedCallback(this, slot, change));
    }
  }

  /**
   * Deletes this gui and despawns its entity
   */
  despawn() {
    try {
      this.entity?.triggerEvent("despawn");
    } catch (error) {}
    try {
      delete CHESTGUIS[this.player.name];
    } catch (error) {}
    if (this.tickEvent) world.events.tick.unsubscribe(this.tickEvent);
    if (this.slotChangeEvent)
      onEntityInventorySlotChange.unsubscribe(this.slotChangeEvent);
  }
}
