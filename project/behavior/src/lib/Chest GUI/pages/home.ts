import { PageItem } from "../Models/PageItem.js";
import { Page } from "../Models/Page.js";
import { MinecraftItemTypes } from "@minecraft/server";

/**
 * The Home page of this GUI this is the most important because
 * when the GUI is opened it will open up here, any plugin can
 * change this but this is the default screen
 */
export let HOME_PAGE = new Page("home")
  .setSlots(
    [22],
    new PageItem(MinecraftItemTypes.enderChest, {
      nameTag: "§l§bInventory Viewer",
    }),
    (ctx) => {
      ctx.PageAction("moderation:see");
    }
  )
  .setSlots(
    [54],
    new PageItem(MinecraftItemTypes.barrier, { nameTag: "§cClose GUI" }),
    (ctx) => {
      ctx.CloseAction();
    }
  );
