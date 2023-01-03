import {
  MinecraftEffectTypes,
  MinecraftItemTypes,
  Player,
  Vector3,
} from "@minecraft/server";
import {
  ILocationLog,
  onPlayerMove,
} from "../../../../lib/Events/onPlayerMove";
import {
  ANTI_TP_DISTANCE_THRESHOLD,
  MOVEMENT_CONSTANTS,
  MOVEMENT_DISTANCE_THRESHOLD,
  SPEED_EFFECT_INCREASE,
  TAGS,
} from "../../config/movement";
import { getRole } from "../../utils";
import { PlayerLog } from "../models/PlayerLog";
import { Protection } from "../models/Protection";

const violations = new PlayerLog<number>();

/**
 * Calculates the distance from loc1 to loc2
 * @param {Location} loc1 location 1
 * @param {Location} loc2 location 2
 * @returns {number}
 */
function distanceBetween(loc1: Vector3, loc2: Vector3): number {
  return Math.hypot(loc2.x - loc1.x, loc2.z - loc1.z);
}

/**
 * Gets the speed offset based on a players SpeedEffect
 * @param player player to get
 */
function getSpeedOffset(player: Player): number {
  const speed = player.getEffect(MinecraftEffectTypes.speed)?.amplifier ?? 0;
  return speed * SPEED_EFFECT_INCREASE;
}

/**
 * Checks if a distance traveled is big enough to be flagged
 * @param distance distance the player has traveled
 * @returns if this distance is bad
 */
function isDistanceFlag(distance: number, player: Player): boolean {
  const speedIntensity = getSpeedOffset(player);
  const offset = MOVEMENT_CONSTANTS.run.distance + MOVEMENT_DISTANCE_THRESHOLD;
  return distance > speedIntensity + offset;
}

function flag(player: Player, old: ILocationLog) {
  const violationCount = (violations.get(player) ?? 0) + 1;
  violations.set(player, violationCount);
  onPlayerMove.delete(player); // Reset Players old location
  if (violationCount < 3) return;
  player.teleport(
    old.location,
    old.dimension,
    player.rotation.x,
    player.rotation.y
  );
}

/**
 * The key used to unsubscribe from this event
 */
let onPlayerMoveSubKey: number = null;

const protection = new Protection<{
  tpCheck: boolean;
}>(
  "movement",
  "Blocks illegal movements on players",
  "textures/ui/move.png",
  true
).setConfigDefault({
  tpCheck: {
    description: "If teleports should be flagged",
    defaultValue: true,
  },
});

protection
  .onEnable(() => {
    const config = protection.getConfig();
    onPlayerMoveSubKey = onPlayerMove.subscribe((player, old) => {
      if (getRole(player) == "admin") return;
      if (player.dimension.id != old.dimension.id) return;
      if (player.getTags().some((tag) => TAGS.includes(tag))) return;
      const distance = distanceBetween(player.location, old.location);
      if (player.hasTag(`skip-movement-check`))
        return player.removeTag(`skip-movement-check`);
      if (distance > ANTI_TP_DISTANCE_THRESHOLD) {
        if (!config.tpCheck) return;
        // Anti Tp.
        flag(player, old);
      } else {
        // Anti speed/jet pack
        if (!isDistanceFlag(distance, player)) return;
        // Flagged
        flag(player, old);
      }
    });
  })
  .onDisable(() => {
    onPlayerMove.unsubscribe(onPlayerMoveSubKey);
  });

protection.subscribe("dataDrivenEntityTriggerEvent", (data) => {
  if (!(data.entity instanceof Player)) return;
  if (data.id != "on_death") return;
  onPlayerMove.delete(data.entity); // Reset Players old location
});

protection.subscribe("projectileHit", ({ projectile, source }) => {
  if (projectile.typeId != MinecraftItemTypes.enderPearl.id) return;
  if (!(source instanceof Player)) return;
  onPlayerMove.delete(source); // Reset Players old location
});

protection.subscribe("itemCompleteCharge", ({ itemStack, source }) => {
  if (itemStack.typeId != MinecraftItemTypes.chorusFruit.id) return;
  if (!(source instanceof Player)) return;
  onPlayerMove.delete(source); // Reset Players old location
});
