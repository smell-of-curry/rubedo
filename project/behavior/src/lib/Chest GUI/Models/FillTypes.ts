import { Entity } from "@minecraft/server";
import { AIR } from "../../../index.js";
import { Page } from "./Page.js";

export type FillTypeCallback = (
  entity: Entity,
  page: Page,
  extras: any
) => void;

/**
 * Fills a entity with desired items
 */
export function DefaultFill(entity: Entity, page: Page, extras: any) {
  const container = entity.getComponent("minecraft:inventory").container;
  for (let i = 0; i < container.size; i++) {
    const slot = page.slots[i];
    if (!slot || !slot.item) {
      container.setItem(i, AIR);
      continue;
    }
    container.setItem(i, slot.item.itemStack);
  }
}
