import { MinecraftEffectTypes, Player, world } from "@minecraft/server";
import { getServerOwnerName, setRole, setServerOwner } from "../../utils";

let e = world.events.beforeDataDrivenEntityTriggerEvent.subscribe((data) => {
  if (!(data.entity instanceof Player)) return;
  if (data.id != "rubedo:becomeAdmin") return;
  // Rubedo is now verified to be at the top
  data.entity.removeTag("CHECK_PACK");
  const serverOwnerName = getServerOwnerName();
  if (serverOwnerName) {
    data.entity.playSound("note.bass");
    data.entity.tell(
      `§cFailed to give server owner: "${serverOwnerName}" is already owner!`
    );
    return world.events.beforeDataDrivenEntityTriggerEvent.unsubscribe(e);
  }
  setRole(data.entity, "admin");
  setServerOwner(data.entity);
  data.entity.addEffect(MinecraftEffectTypes.blindness, 3, 255, true);
  data.entity.tell(
    `§aYou have now been set as the "owner" of this server. The command "/function start" will not do anything anymore, type "-help" for more information!`
  );
});
