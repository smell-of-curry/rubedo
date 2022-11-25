import {
  world,
  Player,
  TickEvent,
  BlockLocation,
  MinecraftBlockTypes,
  Entity,
  MinecraftDimensionTypes,
  Location,
  Enchantment,
} from "@minecraft/server";
import type {
  ConfigType,
  durationSegment,
  durtationSegmentType,
  ROLES,
} from "./types";
import { TABLES } from "./lib/Database/tables";
import { Region } from "./modules/models/Region.js";
import { ChangePlayerRoleTask } from "./modules/models/Task";
import type { IplayerTickRegister } from "./types";
import { MessageForm } from "./lib/Form/Models/MessageForm";
import { BANNED_BLOCKS, BANNED_ITEMS } from "./config/moderation";
import { ENCHANTMENTS } from "./config/enchantments";
import { APPEAL_LINK } from "./config/app";

/**
 * This is to reduce lag when grabbing dimensions keep them set and pre-defined
 */
export const DIMENSIONS = {
  overworld: world.getDimension(MinecraftDimensionTypes.overworld),
  nether: world.getDimension(MinecraftDimensionTypes.nether),
  theEnd: world.getDimension(MinecraftDimensionTypes.theEnd),
  "minecraft:overworld": world.getDimension(MinecraftDimensionTypes.overworld),
  "minecraft:nether": world.getDimension(MinecraftDimensionTypes.nether),
  "minecraft:the_end": world.getDimension(MinecraftDimensionTypes.theEnd),
};

/**
 * Kicks a player
 * @param player player who should be kicked
 * @param message the message that should be show to player
 * @param by who kicked the player
 * @param onFail this needs to be used for loops to unregister
 */
export function kick(
  player: Player,
  message: Array<String> = [],
  by: String = "Rubedo Anticheat",
  onFail?: () => void
): void {
  console.warn(message)
  if (isServerOwner(player)) {
    console.warn(`[WARNING]: ${by} attempted to kick ${player.name} but failed`);
    player.tell(`§c ${by} attempted to kick server owner!`);
    return onFail?.();
  }
  try {
    player.runCommand(`kick "${player.name}" §r${message.join("\n")}`);
    player.triggerEvent("kick");
  } catch (error) {
    if (!/"statusCode":-2147352576/.test(error)) return;
    // This function just tried to kick the owner
    if (onFail) onFail();
  }
}

/**
 * Get score of an entity
 * @example getScore(Entity, 'Money');
 */
export function getScore(entity: Entity, objective: string): number {
  try {
    return world.scoreboard.getObjective(objective).getScore(entity.scoreboard);
  } catch (error) {
    return 0;
  }
}

/**
 * grabs the score of a entity off of nameTag
 * @param name Entity's name
 * @param objective objective to get
 * @returns the score of the entity
 */
export function getScoreByName(name: string, objective: string): number {
  try {
    const command = DIMENSIONS.overworld.runCommand(
      `scoreboard players test "${name}" "${objective}" * *`
    );
    return parseInt(String(command.statusMessage?.split(" ")[1]), 10);
  } catch (error) {
    return 0;
  }
}

/**
 * sets the score of a name
 * @example setScore("Smell of curry", 'Money');
 */
export function setScore(
  entityName: string,
  objective: string,
  value: Number
): void {
  try {
    return DIMENSIONS.overworld.runCommand(
      `scoreboard players set "${entityName}" ${objective} ${value}`
    );
  } catch (error) {
    console.warn(error + error.stack);
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
 * Checks if the server is locked down
 */
export function isLockedDown(): boolean {
  return (world.getDynamicProperty("isLockDown") ?? false) as boolean;
}

/**
 * sets the server's lockdown status
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
const CALLBACKS: IplayerTickRegister[] = [];

/**
 * Sends a callback for each player
 * @returns the key to disable this callback
 */
export function forEachValidPlayer(
  callback: (player: Player, event: TickEvent) => void,
  delay = 0
) {
  CALLBACKS.push({ callback: callback, delay: delay, lastCall: 0 });
}

world.events.tick.subscribe((tick) => {
  const players = [...world.getPlayers()];
  for (const [i, player] of players.entries()) {
    if (["moderator", "admin"].includes(getRole(player))) continue;
    for (const CALLBACK of CALLBACKS) {
      if (
        CALLBACK.delay != 0 &&
        tick.currentTick - CALLBACK.lastCall < CALLBACK.delay
      )
        continue;
      CALLBACK.callback(player, tick);
      if (i == players.length - 1) CALLBACK.lastCall = tick.currentTick;
    }
  }
});

/**
 * Runs a Command
 * @param command a minecraft /command
 * @param dimension: "overworld" | "nether" | "the end"
 * @param debug: true console logs the command, else it runs command
 * @example runCommand(`say test`)
 */
export function runCommand(
  command: string,
  dimension: string = "overworld",
  debug: boolean = false
): Object {
  try {
    return debug
      ? console.warn(JSON.stringify(this.runCommand(command)))
      : DIMENSIONS.overworld.runCommand(command);
  } catch (error) {
    return { error: true };
  }
}

/**
 * Gets a players id based on a saved database values
 * @param playerName playerName to get
 */
export function getId(playerName: string): string | null {
  return TABLES.ids.get(playerName);
}

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
 * Duration converter
 * @param duration time to convert
 * @example ```
 * durationToMs("10s")
 * durationToMs("10d,2y")
 * durationToMs("5m")
 * durationToMs("23ms,10s")
 * ```
 */
export function durationToMs(duration: string): number {
  /**
   * This holds the different duration values this duration can have
   * @example `["10d", "20s", "2h"]`
   * @example `["2h"]`
   */
  const values: durationSegment[] = duration.split(",") as durationSegment[];
  console.warn(values.length);
  let ms = 0;
  for (const value of values) {
    const length = parseInt(value.match(/\D+|\d+/g)[0]);
    const unit = value.match(/\D+|\d+/g)[1] as durtationSegmentType;
    if (unit == "y") ms = ms + 3.17098e-11 * length;
    if (unit == "w") ms = ms + 6.048e8 * length;
    if (unit == "d") ms = ms + 8.64e7 * length;
    if (unit == "h") ms = ms + 3.6e6 * length;
    if (unit == "m") ms = ms + 60000 * length;
    if (unit == "s") ms = ms + 1000 * length;
    if (unit == "ms") ms = ms + length;
  }
  return ms;
}

/**
 * Converts a date stored in ms to a Date string
 * @param duration milliseconds to convert
 * @returns Date as a string
 */
export function msToTime(duration: number) {
  return new Date(duration).toString();
}

/**
 * Converts a location to a block location
 */
export function locationToBlockLocation(loc: Location): BlockLocation {
  return new BlockLocation(
    Math.floor(loc.x),
    Math.floor(loc.y),
    Math.floor(loc.z)
  );
}

/**
 * Sends a confirmation message to a player to confirm a action
 * @param action action message to confirm
 * @param onConfirm callback to run when a player confirms the action
 * @param onCancel callback to run when a player cancels the action, this can be null
 * @example ```
 * confirmAction("Ban Smell of curry", () => {
 * new Ban("Smell of curry")
 * })
 * ```
 */
export function confirmAction(
  player: Player,
  action: string,
  onConfirm: () => void,
  onCancel: () => void = () => {}
) {
  new MessageForm("Confirm To Continue", action)
    .setButton1("Confirm", onConfirm)
    .setButton2("Never Mind", onCancel)
    .show(player);
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
