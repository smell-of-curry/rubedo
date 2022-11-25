import { Player, world } from "@minecraft/server";
import { ENTITY_INVENTORY, GUI_ITEM } from "../../config/chest";
import { DIMENSIONS, getRole } from "../../utils.js";
import { setTickInterval } from "../Scheduling/utils";
import { ChestGUI } from "./Models/EntityChest";
import { CHESTGUIS, CHEST_OPEN, getHeldItem } from "./utils.js";
import "./pages/home";

world.events.tick.subscribe((data) => {
  for (const player of world.getPlayers()) {
    if (getRole(player) != "admin") continue;
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
    CHESTGUIS[player.name] = new ChestGUI(player);
  }
});

world.events.beforeDataDrivenEntityTriggerEvent.subscribe((data) => {
  if (!(data.entity instanceof Player)) return;
  if (data.id == "rubedo:has_container_open") {
    CHEST_OPEN.set(data.entity, true);
  } else if (data.id == "rubedo:dosent_have_container_open") {
    CHEST_OPEN.set(data.entity, false);
  }
});

/**
 * This system will detect false entities and kill them
 * reduce lag and eliminate broken/left players/entities
 */
setTickInterval(() => {
  const vaildIds = Object.values(CHESTGUIS).map((c) => c.entity.id);
  for (const entity of DIMENSIONS.overworld.getEntities({
    type: ENTITY_INVENTORY,
  })) {
    if (vaildIds.includes(entity.id)) continue;
    // This entity is not valid so we despawn it
    entity.triggerEvent("despawn");
  }
}, 100);
