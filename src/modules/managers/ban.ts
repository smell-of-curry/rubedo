import { TABLES } from "../../lib/Database/tables.js";
import { kick, forEachValidPlayer, msToTime, getConfigId } from "../../utils.js";

forEachValidPlayer((player) => {
  try {
    const banData = TABLES.bans.get(player.id);
    if (!banData) return;
    if (banData.expire && banData.expire < Date.now())
      return TABLES.bans.delete(player.id);
    kick(
      player,
      [
        `§cYou have been banned!`,
        `§aReason: §f${banData.reason}`,
        `§fExpiry: §b${
          banData.expire ? msToTime(banData.expire - Date.now()) : "Forever"
        }`,
        `§fAppeal at: §b${getConfigId("appealLink")}`,
      ],banData.by,
      () => {
        console.warn(new Error("Failed to kick player"));
        TABLES.bans.delete(player.id);
      }
    );
  } catch (error) {
    console.warn(error + error.stack);
  }
}, 20);
