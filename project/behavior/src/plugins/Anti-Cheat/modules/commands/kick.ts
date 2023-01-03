import { ArgumentTypes, Command } from "../../../../lib/Command/Command";
import { getRole, kick } from "../../utils";

new Command({
  name: "kick",
  description: "Kicks a player from the game",
  requires: (player) => getRole(player) == "admin",
})
  .argument(new ArgumentTypes.player())
  .string("reason")
  .executes((ctx, player, reason) => {
    kick(player, [reason]);
    ctx.reply(`§aKicked ${player.name} from world`);
  });
