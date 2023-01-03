import {
  BlockLocation,
  Entity,
  Location,
  MinecraftDimensionTypes,
  Player,
  system,
  Vector3,
  world,
} from "@minecraft/server";
import { TABLES } from "./database/tables";
import { MessageForm } from "./lib/Form/Models/MessageForm";
import { durationSegment, durationSegmentType } from "./types";

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
 * sets the score of a name
 * @example setScore("Smell of curry", 'Money');
 */
export function setScore(
  entityName: string,
  objective: string,
  value: Number
): void {
  try {
    DIMENSIONS.overworld.runCommandAsync(
      `scoreboard players set "${entityName}" ${objective} ${value}`
    );
  } catch (error) {
    console.warn(error + error.stack);
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
    const unit = value.match(/\D+|\d+/g)[1] as durationSegmentType;
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
export function vector3ToBlockLocation(loc: Vector3): BlockLocation {
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
 * Sleeps your code
 * @param {number} tick time in ticks you want the return to occur
 * @returns {Promise<void>}
 */
export function sleep(tick: number): Promise<void> {
  return new Promise((resolve) => {
    let runScheduleId = system.runSchedule(() => {
      resolve();
      system.clearRunSchedule(runScheduleId);
    }, tick);
  });
}

/**
 * Checks if a location equals another location
 * @param a first location
 * @param b location to test against first
 * @returns {boolean} if they locations are the same
 */
export function LocationEquals(
  a: Vector3 | Location | BlockLocation,
  b: Vector3 | Location | BlockLocation
): boolean {
  let aLocations = [a.x, a.y, a.z];
  let bLocations = [a.x, a.y, a.z];
  if (a instanceof BlockLocation || b instanceof BlockLocation) {
    aLocations = aLocations.map((v) => Math.trunc(v));
    bLocations = bLocations.map((v) => Math.trunc(v));
  }
  return aLocations.find((v, i) => bLocations[i] != v) ? false : true;
}

/**
 * Sorts 3D vectors to a min and max vector
 * @param vector1
 * @param vector2
 * @returns {[Vector3, Vector3]}
 * @author "mrpatches123"
 */
export function sort3DVectors(
  vector1: Vector3,
  vector2: Vector3
): [Vector3, Vector3] {
  const { x: x1, y: y1, z: z1 } = vector1;
  const { x: x2, y: y2, z: z2 } = vector2;
  const ox1 = x1 < x2 ? x1 : x2;
  const oy1 = y1 < y2 ? y1 : y2;
  const oz1 = z1 < z2 ? z1 : z2;
  const ox2 = x1 < x2 ? x2 : x1;
  const oy2 = y1 < y2 ? y2 : y1;
  const oz2 = z1 < z2 ? z2 : z1;
  return [
    { x: ox1, y: oy1, z: oz1 },
    { x: ox2, y: oy2, z: oz2 },
  ];
}

/**
 * Checks if a target vector is between two vectors
 * @param target
 * @param vector1
 * @param vector2
 * @returns
 * @author "mrpatches123"
 */
export function betweenVector3(
  target: Vector3,
  vector1: Vector3,
  vector2: Vector3
): boolean {
  const [{ x: x1, y: y1, z: z1 }, { x: x2, y: y2, z: z2 }] = sort3DVectors(
    vector1,
    vector2
  );
  let { x, y, z } = target;
  return x >= x1 && x <= x2 && y >= y1 && y <= y2 && z >= z1 && z <= z2;
}

/**
 * Splits a string into chunk sizes
 */
export function chunkString(str: string, length: number): string[] {
  return str.match(new RegExp(".{1," + length + "}", "g"));
}
