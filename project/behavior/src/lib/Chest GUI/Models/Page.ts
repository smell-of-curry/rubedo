import { PAGES } from "../utils.js";
import { DefaultFill, FillTypeCallback } from "./FillTypes";
import { ItemGrabbedCallback } from "./ItemGrabbedCallback.js";
import type { PageItem } from "./PageItem";

export interface ISlot {
  /**
   * The item that should be in this slot
   */
  item: PageItem;
  /**
   * What happens when there is a change in this slot
   */
  action: (ctx: ItemGrabbedCallback) => void;
}

export class Page {
  /**
   * The id this page has
   */
  id: string;
  /**
   * How this page fills, these can be custom or kept default
   */
  fillType: FillTypeCallback;

  /**
   * The slots in this gui
   */
  slots: ISlot[];

  constructor(id: string, fillType: FillTypeCallback = DefaultFill) {
    if (Object.keys(PAGES).includes(id))
      throw new Error(`Page: ${id}, Already exists!`);
    this.id = id;
    this.fillType = fillType;
    this.slots = [];
    PAGES[id] = this;
  }

  /**
   * Sets slots in this page
   */
  setSlots(
    slot: Array<number>,
    item: PageItem,
    action: (ctx: ItemGrabbedCallback) => void
  ): Page {
    const data = item ? { item: item, action: action } : null;
    for (const i of slot) {
      this.slots[i] = data;
    }
    return this;
  }
}
