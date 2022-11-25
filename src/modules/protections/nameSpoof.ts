import { world } from "@minecraft/server";
import { TABLES } from "../../lib/Database/tables";
import { kick } from "../../utils";

/**
 * If a player is using this name we know there using toolbox
 */
const TOOLBOX_NAME = `§c§k§m§A§r§cToolbox Gamer§k§mA§r`;

world.events.playerJoin.subscribe(({ player }) => {
  const fail = () =>
    kick(player, [
      `§cYou have been kicked!`,
      `§aReason: §f'${player.name}' is Detected for nameSpoof`,
      `§fThis Server requires you to have a valid gamertag!`,
    ], "Rubedo Auto Mod");
  if (player.name == TOOLBOX_NAME) return fail();
  if ([...world.getPlayers()].filter((p) => p.name == player.name).length > 1)
    return fail();
  if ((TABLES.ids.get(player.name) ?? player.id) != player.id) return fail();
  if (player.name.includes("§")) return fail();

  // Player Probably isnt namespoofing
});
