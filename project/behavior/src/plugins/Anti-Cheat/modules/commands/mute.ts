import { ArgumentTypes, Command } from "../../../../lib/Command/Command.js";
import { Mute } from "../models/Mute.js";
import { getRole } from "../../utils.js";
import { TABLES } from "../../../../database/tables.js";
import { text } from "../../../../lang/text.js";
import { msToTime } from "../../../../utils.js";

const root = new Command({
  name: "mute",
  description: "Manage Mutes",
  requires: (player) => ["admin", "moderator"].includes(getRole(player)),
});

root
  .literal({
    name: "add",
    description: "Mutes a player",
  })
  .argument(new ArgumentTypes.player("player"))
  .argument(new ArgumentTypes.duration("duration"))
  .string("reason")
  .executes((ctx, player, duration, reason) => {
    new Mute(player, duration, reason, ctx.sender.name);
    ctx.reply(
      `§cMuted §f"§a${player.name}§f" §cfor ${duration} Because: "${reason}" §aSuccessfully`
    );
    player.tell(
      `§cYou have been muted by §f"${ctx.sender.name}" §cfor ${duration} Because: "${reason}"`
    );
  });

root
  .literal({
    name: "remove",
    description: "un-mutes a player",
  })
  .argument(new ArgumentTypes.playerName("playerName"))
  .executes((ctx, playerName) => {
    const mute = TABLES.mutes
      .values()
      .find((mute) => mute.playerName == playerName);
    if (!mute) return ctx.reply(`${playerName} is not muted!`);

    TABLES.mutes.delete(mute.playerName);
    try {
      ctx.sender.runCommandAsync(`ability "${playerName}" mute false`);
    } catch (error) {}
    ctx.reply(`§a${playerName}§r has been UnMuted!`);
  });

root
  .literal({
    name: "list",
    description: "Lists all freezes",
  })
  .executes((ctx) => {
    const mutes = TABLES.mutes.values();
    if (mutes.length == 0) return ctx.sender.tell(`§cNo one is muted!`);
    ctx.sender.tell(`§2--- Showing Mutes (${mutes.length}) ---`);
    for (const mute of mutes) {
      ctx.sender.tell(
        text["commands.mutes.list.player"](
          mute.playerName,
          mute.reason,
          mute.expire ? msToTime(mute.expire) : "Forever"
        )
      );
    }
  });
