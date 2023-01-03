import { Location } from "@minecraft/server";
import { TABLES } from "../../../../database/tables.js";
import { DIMENSIONS } from "../../../../utils.js";
import { forEachValidPlayer } from "../../utils.js";

forEachValidPlayer((player) => {
  try {
    const freezeData = TABLES.freezes.get(player.id);

    if (!freezeData)
      return player.getComponent("movement").resetToDefaultValue();
    player.getComponent("movement").setCurrent(0);

    player.teleport(
      new Location(
        freezeData.location.x,
        freezeData.location.y,
        freezeData.location.z
      ),
      DIMENSIONS[freezeData.location.dimension as keyof typeof DIMENSIONS],
      0,
      0
    );
  } catch (error) {}
}, 200);
