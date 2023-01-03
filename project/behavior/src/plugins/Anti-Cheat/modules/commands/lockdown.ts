import { world } from "@minecraft/server";
import { text } from "../../../../lang/text.js";
import { Command } from "../../../../lib/Command/Command.js";
import { confirmAction } from "../../../../utils.js";
import { getRole, isLockedDown, kick, setLockDown } from "../../utils.js";

new Command({
  name: "lockdown",
  description: "Toggles the servers lockdown, meaning no one can join",
  requires: (player) => getRole(player) == "admin",
}).executes((ctx) => {
  if (isLockedDown()) {
    setLockDown(false);
    ctx.sender.tell(`§aUnlocked the server!`);
  } else {
    ctx.reply(`§aClose chat to confirm lockdown`);
    confirmAction(ctx.sender, text["commands.lockdown.confirm"], () => {
      setLockDown(true);
      for (const player of world.getPlayers()) {
        if (getRole(player) == "admin") continue;
        kick(player, text["lockdown.kick.message"]());
      }
      world.say(`§l§cServer is now LOCKED!`);
    });
  }
});
