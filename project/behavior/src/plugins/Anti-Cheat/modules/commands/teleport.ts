import { ArgumentTypes, Command } from "../../../../lib/Command/Command";
import { getRole } from "../../utils";

const root = new Command({
  name: "teleport",
  description: "Teleports entities (players, mobs, etc.).",
  aliases: ["tp"],
  requires: (player) => getRole(player) == "admin",
});

root
  .argument(new ArgumentTypes.player())
  .location("destination")
  .executes((ctx, player, destination) => {
    player.addTag("skip-movement-check");
    player.teleport(destination, player.dimension, 0, 0);
    ctx.reply(
      `Teleported ${player.name} to ${destination.x} ${destination.y} ${destination.z}`
    );
  });
