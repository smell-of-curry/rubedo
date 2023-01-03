import {
  MinecraftBlockTypes,
  MinecraftEntityTypes,
  MinecraftItemTypes,
  Player,
} from "@minecraft/server";
import { AIR } from "../../../../index.js";
import { getGamemode } from "../../utils.js";
import { Protection } from "../models/Protection.js";

/**
 * List of blocks to test
 */
const BLOCKS = [
  MinecraftBlockTypes.chest.id,
  MinecraftBlockTypes.trappedChest.id,
  MinecraftBlockTypes.barrel.id,
  MinecraftBlockTypes.dispenser.id,
  MinecraftBlockTypes.dropper.id,
  MinecraftBlockTypes.furnace.id,
  MinecraftBlockTypes.litFurnace.id,
  MinecraftBlockTypes.blastFurnace.id,
  MinecraftBlockTypes.litBlastFurnace.id,
  MinecraftBlockTypes.smoker.id,
  MinecraftBlockTypes.litSmoker.id,
  MinecraftBlockTypes.hopper.id,
  MinecraftBlockTypes.beehive.id,
  MinecraftBlockTypes.beeNest.id,
  MinecraftBlockTypes.mobSpawner.id,
];

/**
 * List of items to test
 */
const CHEST_BOATS = [
  MinecraftItemTypes.chestBoat.id,
  MinecraftItemTypes.oakChestBoat.id,
  MinecraftItemTypes.birchChestBoat.id,
  MinecraftItemTypes.acaciaChestBoat.id,
  MinecraftItemTypes.jungleChestBoat.id,
  MinecraftItemTypes.spruceChestBoat.id,
  MinecraftItemTypes.darkOakChestBoat.id,
  MinecraftItemTypes.mangroveChestBoat.id,
];

new Protection(
  "nbt",
  "Blocks illegal nbt on items",
  "textures/ui/icon_random.png",
  true
)
  .subscribe("blockPlace", async ({ block }) => {
    if (!BLOCKS.includes(block.typeId)) return;
    const permutation = block.permutation;
    await block.dimension.runCommandAsync(
      `setblock ${block.x} ${block.y} ${block.z} ${block.typeId}`
    );
    block.setPermutation(permutation);
  })
  .subscribe("beforeItemUseOn", (data) => {
    if (!(data.source instanceof Player)) return;
    if (!CHEST_BOATS.includes(data.item.typeId)) return;
    data.cancel = true;
    data.source.dimension.spawnEntity(
      MinecraftEntityTypes.chestBoat.id,
      data.blockLocation.above()
    );
    if (getGamemode(data.source) == "creative") return;
    data.source
      .getComponent("inventory")
      .container.setItem(data.source.selectedSlot, AIR);
  });
