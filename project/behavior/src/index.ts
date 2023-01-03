console.warn(`---- STARTING RUBEDO ----`);
import {
  ItemStack,
  MinecraftItemTypes,
  system,
} from "@minecraft/server";
import "./lib/Command/index";
import "./lib/Chest GUI/index";
import "./plugins/import";
import "./database/index";

system.events.beforeWatchdogTerminate.subscribe((data) => {
  data.cancel = true;
  console.warn(`WATCHDOG TRIED TO CRASH = ${data.terminateReason}`);
});

/**
 * This is air as a item,
 */
export const AIR = new ItemStack(MinecraftItemTypes.stick, 0);