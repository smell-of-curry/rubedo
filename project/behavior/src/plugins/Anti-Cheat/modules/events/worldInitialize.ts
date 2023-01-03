import {
  DynamicPropertiesDefinition,
  MinecraftEntityTypes,
  world,
} from "@minecraft/server";
import { OBJECTIVES } from "../../../../config/objectives";

world.events.worldInitialize.subscribe(({ propertyRegistry }) => {
  let def2 = new DynamicPropertiesDefinition();
  def2.defineString("role", 30);
  propertyRegistry.registerEntityTypeDynamicProperties(
    def2,
    MinecraftEntityTypes.player
  );

  let def3 = new DynamicPropertiesDefinition();
  def3.defineString("worldsOwner", 100);
  def3.defineBoolean("isLockDown");
  propertyRegistry.registerWorldDynamicProperties(def3);

  for (const obj of OBJECTIVES) {
    world.scoreboard.addObjective(obj.objective, obj.displayName ?? "");
  }
});
