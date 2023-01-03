import { BlockLocation, Entity, MinecraftBlockTypes } from "@minecraft/server";
import { DEFAULT_REGION_PERMISSIONS } from "../../config/region";
import { TABLES } from "../../../../database/tables";
import type { IRegionCords, IRegionPermissions } from "../../../../types";
import { loadRegionDenys } from "../../utils.js";
import { betweenVector3, DIMENSIONS } from "../../../../utils";

/**
 * Holds all regions in memory so its not grabbing them so much
 */
export let REGIONS: Array<Region> = [];

/**
 * If the regions have been grabbed if not it will grab them and set this to true
 */
let REGIONS_HAVE_BEEN_GRABBED: boolean = false;

/**
 * The Lowest Y value in minecraft
 */
const LOWEST_Y_VALUE: number = -64;

/**
 * The HIGHEST Y value in minecraft
 */
const HIGHEST_Y_VALUE: number = 320;

export class Region {
  dimensionId: string;
  from: IRegionCords;
  to: IRegionCords;
  key: string;
  permissions: IRegionPermissions;

  /**
   * Gets all regions
   */
  static async getAllRegionsSync(): Promise<Array<Region>> {
    if (REGIONS_HAVE_BEEN_GRABBED) return REGIONS;
    const regions = (await TABLES.regions.valuesSync()).map(
      (region) =>
        new Region(
          region.from,
          region.to,
          region.dimensionId,
          region.permissions,
          region.key
        )
    );
    regions.forEach((r) => {
      REGIONS.push(r);
    });
    REGIONS_HAVE_BEEN_GRABBED = true;
    return regions;
  }

  static getAllRegions(): Array<Region> {
    if (REGIONS_HAVE_BEEN_GRABBED) return REGIONS;
    const regions = TABLES.regions
      .values()
      .map(
        (region) =>
          new Region(
            region.from,
            region.to,
            region.dimensionId,
            region.permissions,
            region.key
          )
      );
    regions.forEach((r) => {
      REGIONS.push(r);
    });
    REGIONS_HAVE_BEEN_GRABBED = true;
    return regions;
  }

  /**
   * Checks if a block location is in region
   */
  static blockLocationInRegion(
    blockLocation: BlockLocation,
    dimensionId: string
  ): Region | undefined {
    return this.getAllRegions().find(
      (region) =>
        region.dimensionId == dimensionId &&
        betweenVector3(
          blockLocation,
          { x: region.from.x, y: LOWEST_Y_VALUE, z: region.from.z },
          { x: region.to.x, y: HIGHEST_Y_VALUE, z: region.to.z }
        )
    );
  }

  /**
   * Checks if a block location is in region
   */
  static async blockLocationInRegionSync(
    blockLocation: BlockLocation,
    dimensionId: string
  ): Promise<Region | undefined> {
    return (await this.getAllRegionsSync()).find(
      (region) =>
        region.dimensionId == dimensionId &&
        betweenVector3(
          blockLocation,
          { x: region.from.x, y: LOWEST_Y_VALUE, z: region.from.z },
          { x: region.to.x, y: HIGHEST_Y_VALUE, z: region.to.z }
        )
    );
  }

  /**
   * Removes a region at a block Location
   * @param dimensionId the id of this dimension
   * @returns if the region was removed or not
   */
  static async removeRegionAtBlockLocation(
    blockLocation: BlockLocation,
    dimensionId: string
  ): Promise<boolean> {
    const region = this.blockLocationInRegion(blockLocation, dimensionId);
    if (!region) return false;
    return TABLES.regions.delete(region.key);
  }
  /**
   * Creates a new Region to store in db
   */
  constructor(
    from: IRegionCords,
    to: IRegionCords,
    dimensionId: string,
    permissions?: IRegionPermissions,
    key?: string
  ) {
    this.from = from;
    this.to = to;
    this.dimensionId = dimensionId;
    this.permissions = permissions ?? DEFAULT_REGION_PERMISSIONS;
    this.key = key ? key : Date.now().toString();

    if (!key) {
      this.update().then(() => {
        loadRegionDenys();
        REGIONS.push(this);
      });
    }
  }

  /**
   * Updates this region in the database
   */
  async update(): Promise<void> {
    return TABLES.regions.set(this.key, {
      key: this.key,
      from: this.from,
      dimensionId: this.dimensionId,
      permissions: this.permissions,
      to: this.to,
    });
  }

  /**
   * removes this region
   * @returns if the region was removed successfully
   */
  async delete(): Promise<boolean> {
    const region = TABLES.regions.get(this.key);
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
        ?.setType(MinecraftBlockTypes.bedrock);
    }
    REGIONS = REGIONS.filter((r) => r.key != this.key);
    return TABLES.regions.delete(this.key);
  }

  /**
   * Checks if a player is in this region
   * @returns if a entity is in this region or not
   */
  entityInRegion(entity: Entity): Boolean {
    return (
      this.dimensionId == entity.dimension.id &&
      betweenVector3(
        entity.location,
        { x: this.from.x, y: LOWEST_Y_VALUE, z: this.from.z },
        { x: this.to.x, y: HIGHEST_Y_VALUE, z: this.to.z }
      )
    );
  }

  /**
   * Changes a permission to on or off
   */
  changePermission<T extends keyof IRegionPermissions>(
    key: T,
    value: IRegionPermissions[T]
  ): void {
    this.permissions[key] = value;
    this.update();
  }
}
