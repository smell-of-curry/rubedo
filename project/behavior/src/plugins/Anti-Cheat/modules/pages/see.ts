import {
  Entity,
  InventoryComponentContainer,
  Items,
  MinecraftItemTypes,
  world,
} from "@minecraft/server";
import { AIR } from "../../../../index.js";
import { PageItem } from "../../../../lib/Chest GUI/Models/PageItem";
import { Page } from "../../../../lib/Chest GUI/Models/Page";
import { CHESTGUIS } from "../../../../lib/Chest GUI/utils.js";
import { ItemType } from "@minecraft/server";

/**
 * The possible fillable slots where items can be put
 * this is for inventory fill
 */
const FILLABLE_SLOTS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44,
];

/**
 * The possible fillable slots where items can be put
 * this is for inventory fill
 */
const FILLABLE_SLOTS_ENDERCHEST = [
  10, 11, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 24, 25, 28, 29, 30, 31, 32,
  33, 34, 37, 38, 39, 40, 41, 42, 43,
];

/**
 * Fills the chest Screen with the desired kit
 */
export function ViewPlayersFill(entity: Entity, page: Page, extras: any) {
  const container: InventoryComponentContainer = entity.getComponent(
    "minecraft:inventory"
  ).container;

  for (let i = 0; i < container.size; i++) {
    const slot = page.slots[i];
    if (!slot || !slot.item) {
      container.setItem(i, AIR);
      continue;
    }
    container.setItem(i, slot.item.itemStack);
  }
  for (const [i, player] of [...world.getPlayers()].entries()) {
    const slot = FILLABLE_SLOTS[i];
    const item = new PageItem(MinecraftItemTypes.skull, {
      nameTag: player.name,
      data: 3,
    });
    container.setItem(slot, item.itemStack);
    page.slots[slot] = {
      item: item,
      action: (ctx) => {
        ctx.PageAction("moderation:see_inventory", { name: player.name });
      },
    };
  }
}

/**
 * Fills the chest Screen with the desired kit
 */
export function ViewPlayerInventoryFill(
  entity: Entity,
  page: Page,
  extras: any
) {
  const container = entity.getComponent("minecraft:inventory").container;

  for (let i = 0; i < container.size; i++) {
    const slot = page.slots[i];
    if (!slot || !slot.item) {
      container.setItem(i, AIR);
      continue;
    }
    container.setItem(i, slot.item.itemStack);
  }
  const EnderChestItem = new PageItem(MinecraftItemTypes.enderChest, {
    nameTag: `§eView §f${extras?.name}§e Ender Chest\n§fNote: §cThis will not grab §lANY NBT!§r`,
  });
  container.setItem(49, EnderChestItem.itemStack);
  page.slots[49] = {
    item: EnderChestItem,
    action: (ctx) => {
      ctx.PageAction("moderation:see_ender_chest", { name: extras.name });
    },
  };
  const player = [...world.getPlayers()].find((p) => p.name == extras.name);
  if (!player) {
    const gui = Object.values(CHESTGUIS).find((e) => e.entity.id == entity.id);
    gui.despawn();
    player.tell(`"${extras.name}" Could not be found, Gui Crashed`);
  }
  const inventory = player.getComponent("inventory").container;
  /**
   * the value of how many slots have been taken
   */
  let used_slots = 0;
  for (let i = 0; i < inventory.size; i++) {
    const item = inventory.getItem(i);
    const slot = FILLABLE_SLOTS[used_slots];
    used_slots++;
    if (!item) {
      container.setItem(slot, AIR);
      continue;
    }
    container.setItem(slot, item);
    page.slots[slot] = {
      item: new PageItem(
        Items.get(item.typeId),
        { amount: item.amount, data: item.data },
        item
      ),
      action: (ctx) => {
        if (i < 9) {
          player.runCommandAsync(`replaceitem entity @s slot.hotbar ${i} air`);
        } else {
          player.runCommandAsync(
            `replaceitem entity @s slot.inventory ${i - 9} air`
          );
        }
        ctx.GiveAction();
        page.slots[slot] = {
          item: null,
          action: (ctx) => {
            inventory.addItem(ctx.getItemAdded());
          },
        };
      },
    };
  }
}

/**
 * Fills the chest Screen with the desired kit
 */
export async function ViewPlayerEnderChestFill(
  entity: Entity,
  page: Page,
  extras: any
) {
  const container = entity.getComponent("minecraft:inventory").container;
  for (let i = 0; i < container.size; i++) {
    const slot = page.slots[i];
    if (!slot || !slot.item) {
      container.setItem(i, AIR);
      continue;
    }
    container.setItem(i, slot.item.itemStack);
  }
  const player = [...world.getPlayers()].find((p) => p.name == extras?.name);
  if (!player) {
    const gui = Object.values(CHESTGUIS).find((e) => e.entity.id == entity.id);
    gui.despawn();
    player.tell(`"${extras.name}" Could not be found, Gui Crashed`);
  }
  /**
   * the value of how many slots have been taken
   */
  let used_slots = 0;
  const ItemTypes: ItemType[] = Object.values(MinecraftItemTypes);
  for (const item of ItemTypes) {
    try {
      await player.runCommandAsync(
        `testfor @s[hasitem={item=${item.id},location=slot.enderchest}]`
      );
      const ChestGuiItem = new PageItem(item, {
        nameTag: "Note: §l§cThis is not the exact item",
      });
      const slot = FILLABLE_SLOTS_ENDERCHEST[used_slots];
      container.setItem(slot, ChestGuiItem.itemStack);
      page.slots[slot] = {
        item: ChestGuiItem,
        action: (ctx) => {
          ctx.GiveAction();
          page.slots[slot] = null;
        },
      };
      used_slots++;
    } catch (error) {}
  }
}

new Page("moderation:see", ViewPlayersFill)
  .setSlots(
    [50],
    new PageItem(MinecraftItemTypes.arrow, {
      nameTag: "§fBack",
    }),
    (ctx) => {
      ctx.PageAction("home");
    }
  )
  .setSlots(
    [48],
    new PageItem(MinecraftItemTypes.barrier, { nameTag: "§cClose GUI" }),
    (ctx) => {
      ctx.CloseAction();
    }
  );

new Page("moderation:see_inventory", ViewPlayerInventoryFill)
  .setSlots(
    [50],
    new PageItem(MinecraftItemTypes.arrow, {
      nameTag: "§fBack",
    }),
    (ctx) => {
      ctx.PageAction("moderation:see");
    }
  )
  .setSlots(
    [48],
    new PageItem(MinecraftItemTypes.barrier, { nameTag: "§cClose GUI" }),
    (ctx) => {
      ctx.CloseAction();
    }
  );

new Page("moderation:see_ender_chest", ViewPlayerEnderChestFill)
  .setSlots(
    [50],
    new PageItem(MinecraftItemTypes.arrow, {
      nameTag: "§fBack",
    }),
    (ctx) => {
      ctx.PageAction("moderation:see");
    }
  )
  .setSlots(
    [48],
    new PageItem(MinecraftItemTypes.barrier, { nameTag: "§cClose GUI" }),
    (ctx) => {
      ctx.CloseAction();
    }
  );
