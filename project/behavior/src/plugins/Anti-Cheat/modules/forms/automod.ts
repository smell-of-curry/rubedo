import { Player } from "@minecraft/server";
import { ActionForm } from "../../../../lib/Form/Models/ActionForm";
import { ModalForm } from "../../../../lib/Form/Models/ModelForm";
import { IProtectionsConfig } from "../../../../types";
import { PROTECTIONS } from "../../protections";
import { Protection } from "../models/Protection";
import { showHomeForm } from "./home";

export function showAutoModHomeForm(player: Player) {
  const form = new ActionForm("Manage Protections");

  for (const protection of Object.values(PROTECTIONS)) {
    form.addButton(protection.name, protection.iconPath, () => {
      showProtectionConfig(protection, player);
    });
  }
  form
    .addButton("Back", "textures/ui/arrow_dark_left_stretch.png", () => {
      showHomeForm(player);
    })
    .show(player);
}

export function showProtectionConfig(protection: Protection, player: Player) {
  const data = protection.getConfig();
  const form = new ModalForm(
    `Manage ${protection.name} Protection Config`
  ).addToggle("Enabled", data["enabled"]);
  let keys: string[] = [];
  for (const [key, value] of Object.entries(protection.configDefault)) {
    keys.push(key);
    if (typeof value.defaultValue == "boolean") {
      form.addToggle(value.description, data[key] as boolean);
    } else if (typeof value.defaultValue == "number") {
      form.addSlider(value.description, 0, 100, 1, data[key] as number);
    } else {
      form.addTextField(value.description, null, data[key] as string);
    }
  }
  form.show(player, (ctx, enabled, ...keys) => {
    if (enabled != data["enabled"]) {
      if (enabled) protection.enable();
      if (!enabled) protection.disable();
    }
    let config: IProtectionsConfig = {
      enabled: enabled,
    };
    for (const [i, key] of Object.keys(protection.configDefault).entries()) {
      config[key] = keys[i];
    }
    protection.setConfig(config);
    player.tell(`Updated config for ${protection.name}!`);
  });
}
