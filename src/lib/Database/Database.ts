import {
  ENTITY_IDENTIFIER,
  ENTITY_LOCATION,
  MAX_DATABASE_STRING_SIZE,
} from "../../config/database";
import {
  Entity,
  InventoryComponentContainer,
  ItemStack,
  MinecraftItemTypes,
} from "@minecraft/server";
import { chunkString } from "./utils";
import { DIMENSIONS } from "../../utils.js";

export class Database<Type = never> {
  /**
   * The databse name
   */
  name: string;
  /**
   * The entitys this database has saved, used for memory and speed
   */
  savedEntitys: Array<Entity> | undefined;
  /**
   * Stores the information that this databse has saved
   */
  MEMORY: any | undefined;

  /**
   *  Compresses a value into a shorter string
   * @param string value to compress
   */
  static compress(string: string): string {
    //return LZString.compress(string);
    return string;
  }
  /**
   *  Compresses a value into a shorter string
   * @param string value to compress
   */
  static decompress(string: string): string {
    //return LZString.decompress(string);
    return string;
  }

  /**
   * Creates a new Database Entity
   * @param name the database name
   * @param index the index this entity is
   * @returns Entity that was made
   */
  static createEntity(name: string, index: number): Entity {
    let entity = DIMENSIONS.overworld.spawnEntity(
      ENTITY_IDENTIFIER,
      ENTITY_LOCATION
    );
    entity.setDynamicProperty("name", name);
    entity.setDynamicProperty("index", index);
    const inv: InventoryComponentContainer =
      entity.getComponent("inventory").container;
    const defaultItem = new ItemStack(MinecraftItemTypes.acaciaBoat, 1);
    if (index == 0) defaultItem.nameTag = "{}";
    inv.setItem(0, defaultItem);
    return entity;
  }

  /**
   * Gets the nameTag of the slot from the entitys inventory
   * @param entity entity to grab from
   * @param slot slot value to get
   */
  static getInventorySlotName(entity: Entity, slot: number): string {
    const inv: InventoryComponentContainer =
      entity.getComponent("inventory").container;
    return inv.getItem(slot)?.nameTag;
  }

  /**
   * Sets the nameTag of the slot from the entitys inventory
   * @param entity entity to grab from
   * @param slot slot value to get
   * @param value the value to set it to
   */
  static setInventorySlotName(
    entity: Entity,
    slot: number,
    value: string
  ): void {
    const inv: InventoryComponentContainer =
      entity.getComponent("inventory").container;
    let item = inv.getItem(slot);
    item.nameTag = value;
    return inv.setItem(slot, item);
  }

  /**
   * Creates a new Database
   * @param name max length 16
   */
  constructor(name: string) {
    this.name = name;
    this.savedEntitys = undefined;
    this.MEMORY = undefined;
  }

  /**
   * Grabs all entities this database is associated with
   */
  get entitys(): Array<Entity> {
    if (this.savedEntitys) return this.savedEntitys;
    const ens = DIMENSIONS.overworld
      .getEntitiesAtBlockLocation(ENTITY_LOCATION)
      .filter(
        (e) =>
          e.typeId == ENTITY_IDENTIFIER &&
          e.getDynamicProperty("name") == this.name
      );
    this.savedEntitys = ens;
    return ens;
  }

  /**
   * Grabs the data of this name out of the local database
   */
  data(): { [key: string]: Type } {
    if (this.MEMORY) return this.MEMORY;
    if (this.entitys.length == 0) Database.createEntity(this.name, 0);

    // If there is only one entity there is no need to sort the data out
    if (this.entitys.length == 1) {
      let data = JSON.parse(
        Database.decompress(Database.getInventorySlotName(this.entitys[0], 0))
      );
      this.MEMORY = data;
      return data;
    }
    let data: any = new Array(this.entitys.length);
    for (const entity of this.entitys) {
      let index = entity.getDynamicProperty("index") as number;
      data[index] = Database.getInventorySlotName(entity, 0);
    }
    // idk why this needs try catch but it does :(
    try {
      data = JSON.parse(data.join(""));
    } catch (error) {
      data = {};
    }
    this.MEMORY = data;
    return data;
  }

  /**
   * Saves data into the database
   * @param data data to save
   */
  save(data: { [key: string]: Type }) {
    this.MEMORY = data;
    /**
     * Splits the data into chunks to then save across an array of entitys
     */
    const dataSplit = chunkString(
      Database.compress(JSON.stringify(data)),
      MAX_DATABASE_STRING_SIZE
    );
    if (this.entitys && dataSplit.length == this.entitys.length) {
      for (let i = 0; i < dataSplit.length; i++) {
        Database.setInventorySlotName(this.entitys[i], 0, dataSplit[i]);
      }
    } else {
      // there is either no entitys or a diffrent amount
      this.entitys?.forEach((e) => e?.triggerEvent("despawn"));
      this.savedEntitys = undefined;
      for (let i = 0; i < dataSplit.length; i++) {
        const entity = Database.createEntity(this.name, i);
        Database.setInventorySlotName(entity, 0, dataSplit[i]);
      }
    }
  }

  /**
   * Sets a key to a value in this database
   * @param key key to set
   * @param value value to set the key to
   */
  set(key: string, value: Type) {
    const data = this.data();
    data[key] = value;
    this.save(data);
  }

  /**
   * Grabs a value from the database by key
   * @param key value to grab
   */
  get(key: string): Type {
    return this.data()[key];
  }

  /**
   * Check if the key exists in the table
   * @param key the key to test
   */
  has(key: string): boolean {
    return this.keys().includes(key);
  }

  /**
   * Delete the key from the table
   * @param key the key to test
   */
  delete(key: string): boolean {
    let data = this.data();
    const status = delete data[key];
    this.save(data);
    return status;
  }

  /**
   * Returns the number of key/value pairs in the Map object.
   */
  size(): number {
    return this.keys().length;
  }

  /**
   * Clear everything in the table
   */
  clear(): void {
    this.save({});
  }

  /**
   * Get all the keys in the table
   */
  keys(): string[] {
    return Object.keys(this.data());
  }

  /**
   * Get all the values in the table
   */
  values(): Type[] {
    return Object.values(this.data());
  }

  /**
   * Gets all the keys and values
   */
  getCollection(): { [key: string]: Type } {
    return this.data();
  }
}
