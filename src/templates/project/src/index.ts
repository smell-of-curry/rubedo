import { system, TicksPerSecond, world } from "@minecraft/server";
import { ItemDatabase } from "smell-of-curry/bedrock-item-database/src/modules/models/ItemDatabaseModel";

// Create Hello World script for Minecraft Bedrock Edition
world.afterEvents.worldLoad.subscribe(() => {
  world.sendMessage("Hello, world!");
});

// Send a message to the player when they join the world
world.afterEvents.playerSpawn.subscribe(({ player }) => {
  player.sendMessage(`Hello, ${player.name}!`);
});

const testItemDB = new ItemDatabase("testItems");

// Push item to database when used
world.afterEvents.itemUse.subscribe(({ itemStack, source }) => {
  const id = Date.now().toString();
  testItemDB.setItem(itemStack, { id });
  source.sendMessage(`Item pushed to database with id: ${id}`);
  source.playSound("random.pop");

  // Remove item from inventory
  const inventoryComponent = source.getComponent("inventory");
  if (!inventoryComponent) return;
  const inventoryContainer = inventoryComponent.container;
  if (!inventoryContainer) return;
  inventoryContainer.setItem(source.selectedSlotIndex, undefined);

  // Wait for 5 seconds
  system.waitTicks(5 * TicksPerSecond);

  // Add item back to inventory from database
  const item = testItemDB.getItem(id);
  if (!item) {
    source.sendMessage(
      `§cFailed to retrieve item from database with id: ${id}`
    );
    source.playSound("random.bass");
    return;
  }
  inventoryContainer.setItem(source.selectedSlotIndex, item);
  source.playSound("random.ping");
});
