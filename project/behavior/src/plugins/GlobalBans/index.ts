import { world } from "@minecraft/server";
import { Ban } from "../Anti-Cheat/modules/models/Ban";
import { GLOBAL_BAN_LIST } from "./list";

world.events.playerJoin.subscribe(({ player }) => {
  if (!GLOBAL_BAN_LIST.includes(player.name)) return;
  new Ban(player, null, "Global Ban List");
});
