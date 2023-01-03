import { ArgumentTypes, Command } from "../../../../lib/Command/Command.js";
import { Freeze } from "../models/Freeze.js";
import { getRole } from "../../utils.js";
import { TABLES } from "../../../../database/tables.js";
import { text } from "../../../../lang/text.js";

const root = new Command({
  name: "freeze",
  description: "Manage Freezes",
  requires: (player) => ["admin", "moderator"].includes(getRole(player)),
});

root
  .literal({
    name: "add",
    description: "Freezes a player",
  })
  .argument(new ArgumentTypes.player("player"))
  .string("reason")
  .executes((ctx, player, reason) => {
    new Freeze(player, reason);
    ctx.reply(
      `§cFroze §f"§a${player.name}§f" Because: "${reason}" §aSuccessfully`
    );
    ctx.sender.tell(
      `§cYou have been frozen by §f"§a${ctx.sender.name}§f" Because: "${reason}"`
    );
  });

root
  .literal({
    name: "remove",
    description: "unfreezes a player",
  })
  .argument(new ArgumentTypes.playerName("playerName"))
  .executes((ctx, playerName) => {
    const freeze = TABLES.freezes
      .values()
      .find((freeze) => freeze.playerName == playerName);
    if (!freeze) return ctx.reply(`${playerName} is not frozen`);

    TABLES.freezes.delete(freeze.key);

    ctx.reply(`§a${playerName}§r has been UnFrozen!`);
  });

root
  .literal({
    name: "list",
    description: "Lists all freezes",
  })
  .executes((ctx) => {
    const freezes = TABLES.freezes.values();
    if (freezes.length == 0) return ctx.sender.tell(`§cNo one is frozen!`);
    ctx.sender.tell(`§2--- Showing Freezes (${freezes.length}) ---`);
    for (const freeze of freezes) {
      ctx.sender.tell(
        text["commands.freeze.list.player"](freeze.playerName, freeze.reason)
      );
    }
  });
