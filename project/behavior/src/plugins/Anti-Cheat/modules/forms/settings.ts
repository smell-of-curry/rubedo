import { Player } from "@minecraft/server";
import { APPEAL_LINK } from "../../../../config/app";
import { ENCHANTMENTS } from "../../config/enchantments";
import { ActionForm } from "../../../../lib/Form/Models/ActionForm";
import { ModalForm } from "../../../../lib/Form/Models/ModelForm";
import { getConfigId, setConfigId } from "../../utils";

export function manageBannedItemsForm(player: Player) {
  new ActionForm("Manage Banned Items")
    .addButton("Remove a Banned Item", null, () => {
      removeBannedItemForm(player);
    })
    .addButton("Ban an item", null, () => {
      addBannedItemForm(player);
    })
    .show(player);
}
export function removeBannedItemForm(player: Player) {
  new ModalForm("Remove Banned Items")
    .addDropdown("Select item to remove", getConfigId("banned_items"))
    .show(player, (ctx, item) => {
      let items = getConfigId("banned_items");
      items = items.filter((p) => p != item);
      setConfigId("banned_items", items);
      player.tell(`Removed Banned item "${item}"`);
    });
}

export function addBannedItemForm(player: Player) {
  new ModalForm("Add Banned Item")
    .addTextField("Item Id", "minecraft:string")
    .show(player, (ctx, item) => {
      let items = getConfigId("banned_items");
      if (items.includes(item))
        return ctx.error(`§cItem "${item}" is already banned`);
      items.push(item);
      setConfigId("banned_items", items);
      player.tell(`Banned the item "${item}"`);
    });
}

export function manageBannedBlocksForm(player: Player) {
  new ActionForm("Manage Banned Blocks")
    .addButton("Remove a Banned Block", null, () => {
      removeBannedBlockForm(player);
    })
    .addButton("Ban an block", null, () => {
      addBannedBlockForm(player);
    })
    .show(player);
}

export function removeBannedBlockForm(player: Player) {
  new ModalForm("Remove Banned Block")
    .addDropdown("Select block to remove", getConfigId("banned_blocks"))
    .show(player, (ctx, block) => {
      let blocks = getConfigId("banned_blocks");
      blocks = blocks.filter((p) => p != block);
      setConfigId("banned_blocks", blocks);
      player.tell(`Removed Banned block "${block}"`);
    });
}

export function addBannedBlockForm(player: Player) {
  new ModalForm("Add Banned Block")
    .addTextField("Block Id", "minecraft:barrier")
    .show(player, (ctx, block) => {
      let blocks = getConfigId("banned_blocks");
      if (blocks.includes(block))
        return ctx.error(`§cBlock "${block}" is already banned`);
      blocks.push(block);
      setConfigId("banned_blocks", blocks);
      player.tell(`Banned the block "${block}"`);
    });
}

export function manageEnchantmentLevelsForm(player: Player) {
  new ModalForm("Manage Enchantment Levels")
    .addDropdown("Enchantment to change", Object.keys(ENCHANTMENTS), 0)
    .addTextField("Level (number)", "5")
    .show(player, (ctx, enchantment, levelString) => {
      if (isNaN(levelString as any))
        return ctx.error(
          `§c"${levelString}" is not a number, please enter a value like, "3", "9", etc.`
        );
      const level = parseInt(levelString);
      let enchants = getConfigId("enchantments");
      enchants[enchantment as keyof typeof ENCHANTMENTS] = level;
      setConfigId("enchantments", enchants);
      player.tell(`Set max level for ${enchantment} to ${level}`);
    });
}

export function manageAppealLinkForm(player: Player) {
  new ModalForm("Manage Appeal Link")
    .addTextField("Appeal Link", APPEAL_LINK)
    .show(player, (ctx, link) => {
      setConfigId("appealLink", link);
      player.tell(`Changed the servers appeal link to ${link}`);
    });
}
