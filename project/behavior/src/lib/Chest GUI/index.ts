import { system, world } from "@minecraft/server";
import { ENTITY_INVENTORY, GUI_ITEM } from "../../config/chest";
import { getRole } from "../../plugins/Anti-Cheat/utils.js";
import { ChestGUI } from "./Models/EntityChest";
import { CHESTGUIS, getHeldItem } from "./utils.js";
import "./pages/home";
import { DIMENSIONS } from "../../utils.js";
import { EntitiesLoad } from "../Events/EntitiesLoad";

EntitiesLoad.subscribe(() => {
  system.runSchedule(() => {
    for (const player of world.getPlayers()) {
      /**
       * Loop through all players, check if player has a chest gui
       * if not create them one
       * Once all players are checked verify there are no false entities
       */
      if (getHeldItem(player)?.typeId != GUI_ITEM) {
        if (CHESTGUIS[player.name]) CHESTGUIS[player.name].despawn();
        continue;
      }
      // Player has a item Held we need to verify that they have a gui
      if (Object.keys(CHESTGUIS).includes(player?.name)) continue;
      // Player does not have a chest gui spawn them in one
      if (getRole(player) != "admin") continue;
      CHESTGUIS[player.name] = new ChestGUI(player);
    }
  }, 10);
});

/**
 * This system will detect false entities and kill them to
 * reduce lag and eliminate broken/left players/entities
 */
system.runSchedule(() => {
  const validIds = Object.values(CHESTGUIS).map((c) => c.entity.id);
  for (const entity of DIMENSIONS.overworld.getEntities({
    type: ENTITY_INVENTORY,
  })) {
    if (validIds.includes(entity.id)) continue;
    // This entity is not valid so we despawn it
    entity.triggerEvent("despawn");
  }
}, 100);
