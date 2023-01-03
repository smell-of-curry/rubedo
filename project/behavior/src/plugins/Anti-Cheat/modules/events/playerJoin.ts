import { world } from "@minecraft/server";
import { text } from "../../../../lang/text";
import { TABLES } from "../../../../database/tables";
import { getRole, isLockedDown, kick, setRole } from "../../utils";
import { Mute } from "../models/Mute";
import { ChangePlayerRoleTask } from "../models/Task";
import { EntitiesLoad } from "../../../../lib/Events/EntitiesLoad";

world.events.playerJoin.subscribe(async ({ player }) => {
  await EntitiesLoad.awaitLoad();
  if (isLockedDown() && getRole(player) != "admin")
    return kick(player, text["lockdown.kick.message"]());
  // --
  if (Mute.getMuteData(player)) player.runCommandAsync(`ability @s mute true`);
  if (!TABLES.ids.has(player.name)) {
    // Player is new!
    TABLES.ids.set(player.name, player.id);
  } else {
    player.addTag("old");
  }
  /**
   * This is a role that was tried to push when the player was offline
   * so were setting it now because the player just joined
   */
  const roleToSet = ChangePlayerRoleTask.getPlayersRoleToSet(player.name);
  if (roleToSet) setRole(player, roleToSet);
});
