import {
  world,
  Player,
  BlockLocation,
  MinecraftBlockTypes,
  Enchantment,
  GameMode,
  system,
} from "@minecraft/server";
import type { ConfigType, ROLES } from "../../types";
import { TABLES } from "../../database/tables";
import { Region } from "./modules/models/Region.js";
import { ChangePlayerRoleTask } from "./modules/models/Task";
import type { IplayerTickRegister } from "../../types";
import { BANNED_BLOCKS, BANNED_ITEMS } from "./config/moderation";
import { ENCHANTMENTS } from "./config/enchantments";
import { APPEAL_LINK } from "../../config/app";
import { DIMENSIONS } from "../../utils.js";
import { EntitiesLoad } from "../../lib/Events/EntitiesLoad";

/**
 * Kicks a player
 * @param player player who should be kicked
 * @param message the message that should be show to player
 * @param onFail this needs to be used for loops to unregister
 */
export function kick(
  player: Player,
  message: Array<String> = [],
  onFail?: () => void
): void {
  if (isServerOwner(player)) {
    console.warn(`[WARNING]: TRIED TO KICK OWNER`);
    player.tell(`You have been tried to kick, but you cant!`);
    return onFail?.();
  }
  try {
    player.runCommandAsync(`kick @s §r${message.join("\n")}`);
    player.triggerEvent("kick");
  } catch (error) {
    player.triggerEvent("kick");
    if (!/"statusCode":-2147352576/.test(error)) return;
    // This function just tried to kick the owner
    if (onFail) onFail();
  }
}

/**
 * Gets the role of this player
 * @param player player to get role from
 * @example getRole("Smell of curry")
 */
export function getRole(player: Player | string): keyof typeof ROLES {
  if (player instanceof Player) {
    return TABLES.roles.get(player.name) ?? "member";
  } else {
    return TABLES.roles.get(player) ?? "member";
  }
}

/**
 * Sets the role of this player
 * @example setRole("Smell of curry", "admin")
 */
export function setRole(
  player: Player | string,
  value: keyof typeof ROLES
): void {
  if (typeof player == "string") {
    // we need to create a task that will update the role for
    // that player when they join
    // also we need to set there db_role back
    TABLES.roles.set(player, value);
    /**
     * If the player is in the game just set it now
     * if they are not in the game we will need to create a task
     * to set there role when they join
     */
    const inGamePlayer = [...world.getPlayers()].find((p) => p.name == player);
    if (inGamePlayer) {
      inGamePlayer.setDynamicProperty("role", value);
    } else {
      new ChangePlayerRoleTask(player, value);
    }
  } else {
    // just change both of them no need for task
    TABLES.roles.set(player.name, value);
    player.setDynamicProperty("role", value);
  }
}

/**
 * Checks if a player is the owner of this world that was set using `/function`
 * @param player player to test
 * @returns if player is owner
 */
export function isServerOwner(player: Player): boolean {
  return world.getDynamicProperty("worldsOwner") == player.id;
}

/**
 * Gets the server owner
 * @returns server owners id
 */
export function getServerOwner(): string | null {
  const id = world.getDynamicProperty("worldsOwner") as string;
  if (!id || id == "") return null;
  return id;
}

/**
 * Gets the server owners name
 * @returns server owners name
 */
export function getServerOwnerName(): string | null {
  const ownerId = getServerOwner();
  if (!ownerId) return null;
  const ids = TABLES.ids.collection();
  return Object.keys(ids).find((key) => ids[key] === ownerId);
}

/**
 * Sets the server owner
 * @param player player to set the server owner too
 */
export function setServerOwner(player: Player) {
  if (!player) return world.setDynamicProperty("worldsOwner", "");
  world.setDynamicProperty("worldsOwner", player.id.toString());
}

/**
 * Checks if the server is locked down
 */
export function isLockedDown(): boolean {
  return (world.getDynamicProperty("isLockDown") ?? false) as boolean;
}

/**
 * Sets the server's lock down status
 * @param val if the server is locked down or not
 */
export function setLockDown(val: boolean) {
  world.setDynamicProperty("isLockDown", val);
}

/**
 * Sets Deny blocks at bottom of region every 5 mins
 */
export function loadRegionDenys() {
  for (const region of Region.getAllRegions()) {
    const loc1 = new BlockLocation(
      region.from.x,
      region.dimensionId == "minecraft:overworld" ? -64 : 0,
      region.from.z
    );
    const loc2 = new BlockLocation(
      region.to.x,
      region.dimensionId == "minecraft:overworld" ? -64 : 0,
      region.to.z
    );
    for (const blockLocation of loc1.blocksBetween(loc2)) {
      DIMENSIONS[region.dimensionId as keyof typeof DIMENSIONS]
        .getBlock(blockLocation)
        ?.setType(MinecraftBlockTypes.deny);
    }
  }
}

/**
 * Stores all the callbacks in an array
 */
const CALLBACKS: { [key: number]: IplayerTickRegister } = [];

/**
 * Records the amount of times the forEachValidPlayer function is called
 * used to generate keys for callback
 */
let forEachValidPlayerCalls = 0;

/**
 * Sends a callback for each player
 * @returns the key to disable this callback
 */
export function forEachValidPlayer(
  callback: (player: Player) => void,
  delay = 0
): number {
  const key = forEachValidPlayerCalls;
  CALLBACKS[key] = {
    callback: callback,
    delay: delay,
    lastCall: 0,
  };
  forEachValidPlayerCalls = key + 1;
  return key;
}

/**
 * Sends a callback for each player
 * @returns the key to disable this callback
 */
export function clearForEachValidPlayer(key: number) {
  delete CALLBACKS[key];
}

EntitiesLoad.subscribe(() => {
  system.runSchedule(() => {
    const players = [...world.getPlayers()];
    for (const [i, player] of players.entries()) {
      if (getRole(player) == "admin") continue;
      for (const CALLBACK of Object.values(CALLBACKS)) {
        if (
          CALLBACK.delay != 0 &&
          system.currentTick - CALLBACK.lastCall < CALLBACK.delay
        )
          continue;
        CALLBACK.callback(player);
        if (i == players.length - 1) CALLBACK.lastCall = system.currentTick;
      }
    }
  });
});

/**
 * Grabs config data from the database
 * @param id id to grab
 */
export function getConfigId<T extends keyof ConfigType>(id: T): ConfigType[T] {
  switch (id) {
    case "spam_config":
      return (
        TABLES.config.get("spam_config") ?? {
          repeatedMessages: true,
          zalgo: true,
          violationCount: 0,
          permMutePlayer: false,
        }
      );

    case "cbe_config":
      return (
        TABLES.config.get("cbe_config") ?? {
          clearItem: true,
          violationCount: 0,
          banPlayer: false,
          canAddEnchantment: false,
        }
      );

    case "gamemode_config":
      return (
        TABLES.config.get("gamemode_config") ?? {
          setToSurvival: true,
          clearPlayer: true,
          violationCount: 0,
          banPlayer: false,
        }
      );

    case "nuker_data":
      return (
        TABLES.config.get("nuker_data") ?? {
          violationCount: 0,
          banPlayer: false,
        }
      );
    case "banned_items":
      return TABLES.config.get("banned_items") ?? BANNED_ITEMS;
    case "banned_blocks":
      return TABLES.config.get("banned_blocks") ?? BANNED_BLOCKS;
    case "enchantments":
      return TABLES.config.get("enchantments") ?? ENCHANTMENTS;
    case "appealLink":
      return TABLES.config.get("appealLink") ?? APPEAL_LINK;
  }
}

/**
 * Sets a config id
 * @param key key to set
 * @param value value to set key to
 */
export function setConfigId<T extends keyof ConfigType>(
  key: T,
  value: ConfigType[T]
) {
  TABLES.config.set(key, value);
}

/**
 * Gets the max level of a enchantment
 * @param enchantment enchantment to get
 * @returns max level
 * @example ```
 * getMaxLevel(MinecraftEnchantmentTypes.sharpness): 5
 * ```
 */
export function getMaxEnchantmentLevel(enchantment: Enchantment): number {
  const MAX_ENCHANTMENTS = getConfigId("enchantments");
  return (
    MAX_ENCHANTMENTS[enchantment.type.id as keyof typeof ENCHANTMENTS] ??
    enchantment.type.maxLevel
  );
}

/**
 * Gets the Gamemode of a player
 * @param {Player} player player to get
 * @returns {keyof typeof GameMode}
 * @example if (getGamemode(player) == "creative") return;
 */
export function getGamemode(player: Player): keyof typeof GameMode {
  return Object.values(GameMode).find(
    (g) => [...world.getPlayers({ name: player.name, gameMode: g })].length
  );
}
