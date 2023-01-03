import { Player } from "@minecraft/server";
import { ActionForm } from "../../../../lib/Form/Models/ActionForm";
import * as settings from "./settings";
import * as automod from "./automod";

export function showHomeForm(player: Player) {
  new ActionForm("Rubedo Settings")
    .addButton("Auto Mod", "textures/ui/permissions_op_crown.png", () => {
      automod.showAutoModHomeForm(player);
    })
    .addButton("Banned items", "textures/blocks/sculk_shrieker_top.png", () => {
      settings.manageBannedItemsForm(player);
    })
    .addButton("Banned blocks", "textures/blocks/barrier.png", () => {
      settings.manageBannedBlocksForm(player);
    })
    .addButton("Enchantments", "textures/items/book_enchanted.png", () => {
      settings.manageEnchantmentLevelsForm(player);
    })
    .addButton("Appeal Link", "textures/ui/Feedback.png", () => {
      settings.manageAppealLinkForm(player);
    })
    .show(player);
}
