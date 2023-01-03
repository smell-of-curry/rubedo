import { Location } from "@minecraft/server";
import "./protections";
import "./modules/commands/import";
import "./modules/managers/import";
import "./modules/pages/import";
import "./modules/protections/import";
import "./modules/events/import";

/**
 * Stores npc locations that are verified to allow NPC's to spawn in
 */
export let NPC_LOCATIONS: Array<Location> = [];

export function clearNpcLocations() {
  NPC_LOCATIONS = [];
}
