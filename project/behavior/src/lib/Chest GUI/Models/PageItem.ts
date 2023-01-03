import {
  Enchantment,
  EnchantmentList,
  ItemStack,
  ItemType,
} from "@minecraft/server";

interface IPageItemComponents {
  /**
   * Number of the items in the stack. Valid values range between 0 and 64.
   */
  amount?: number;
  /**
   * A data value used to configure alternate states of the item.
   */
  data?: number;
  /**
   * Given name of this stack of items.
   */
  nameTag?: string;
  /**
   * a secondary display string - for an ItemStack.
   */
  loreList?: string[];
  /**
   * a collection of the enchantments on this item
   */
  enchantments?: Enchantment[];
  /**
   * A key that could be on this item, meaning its connect to database
   */
  dbKey?: string;
}

export class PageItem {
  /**
   * The item type this item has
   */
  itemType: ItemType;
  /**
   * The components that this item
   * this stores information such as data, enchantments etc
   */
  components: IPageItemComponents;

  /**
   * The itemStack that was set at item creation
   */
  setItemStack: ItemStack | null;

  constructor(
    itemType: ItemType,
    components: IPageItemComponents = {},
    itemStack?: ItemStack
  ) {
    this.itemType = itemType;
    this.components = components;
    this.setItemStack = itemStack;
  }
  /**
   * gets itemStack that this PageItem is associated with
   */
  get itemStack(): ItemStack {
    if (this.setItemStack) return this.setItemStack;
    const itemStack = new ItemStack(this.itemType);
    if (this.components) {
      itemStack.amount = this.components?.amount ?? 1;
      itemStack.data = this.components?.data ?? 0;
      itemStack.nameTag = this.components?.nameTag;
      itemStack.setLore(this.components?.loreList ?? []);
      const enchantments: EnchantmentList =
        itemStack.getComponent("enchantments").enchantments;
      for (const enchantment of this.components?.enchantments ?? []) {
        enchantments.addEnchantment(enchantment);
      }
      itemStack.getComponent("enchantments").enchantments = enchantments;
    }
    return itemStack;
  }
}
