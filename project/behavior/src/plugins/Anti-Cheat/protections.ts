import { system } from "@minecraft/server";
import { EntitiesLoad } from "../../lib/Events/EntitiesLoad";
import type { Protection } from "./modules/models/Protection";

/**
 * All protections in this anti-cheat
 */
export const PROTECTIONS: { [key: string]: Protection<any> } = {};

EntitiesLoad.subscribe(() => {
  system.run(() => {
    for (const protection of Object.values(PROTECTIONS)) {
      if (!protection.getConfig().enabled ?? protection.isEnabledByDefault)
        continue;
      protection.enable();
    }
  });
});
