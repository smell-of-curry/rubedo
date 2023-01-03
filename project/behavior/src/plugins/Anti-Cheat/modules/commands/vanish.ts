import { Player, world } from "@minecraft/server";
import { Command } from "../../../../lib/Command/Command.js";
import { getRole } from "../../utils.js";

function vanish(player: Player, say: boolean) {
  if (player.hasTag(`spectator`)) {
    player.runCommandAsync(`gamemode c`);
    player.triggerEvent(`removeSpectator`);
    player.removeTag(`spectator`);
    if (!say) return;
    world.say({
      rawtext: [
        {
          translate: "multiplayer.player.joined",
          with: [`§e${player.name}`],
        },
      ],
    });
  } else {
    player.runCommandAsync(`gamemode spectator`);
    player.triggerEvent(`addSpectator`);
    player.addTag(`spectator`);
    if (!say) return;
    world.say({
      rawtext: [
        {
          translate: "multiplayer.player.left",
          with: [`§e${player.name}`],
        },
      ],
    });
  }
}

new Command({
  name: "vanish",
  description: "Toggles Vanish Mode on the sender",
  requires: (player) => getRole(player) == "admin",
})
  .executes((ctx) => {
    vanish(ctx.sender, false);
  })
  .boolean("say")
  .executes((ctx, say) => {
    vanish(ctx.sender, say);
  });
