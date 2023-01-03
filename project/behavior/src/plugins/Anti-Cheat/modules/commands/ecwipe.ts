import { ArgumentTypes, Command } from "../../../../lib/Command/Command.js";
import { getRole } from "../../utils.js";

new Command({
  name: "ecwipe",
  description: "Clears a players ender chest",
  requires: (player) => getRole(player) == "admin",
})
  .argument(new ArgumentTypes.player("player"))
  .executes((ctx, player) => {
    for (let i = 0; i < 27; i++) {
      player.runCommandAsync(`replaceitem entity @s slot.enderchest ${i} air`);
    }
    ctx.reply(`§aCleared "${player.name}"'s Ender chest!`);
  });
