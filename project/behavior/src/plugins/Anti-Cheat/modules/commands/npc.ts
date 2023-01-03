import { Location } from "@minecraft/server";
import { Command } from "../../../../lib/Command/Command.js";
import { getRole } from "../../utils.js";
import { Npc } from "../models/Npc.js";

new Command({
  name: "npc",
  description: "Spawns a npc at your coordinates",
  requires: (player) => getRole(player) == "admin",
}).executes((ctx) => {
  const { x, y, z } = ctx.sender.location;
  new Npc(new Location(x, y, z), ctx.sender.dimension);
  ctx.reply(`Spawned a verified npc at your current location`);
});
