import { Command } from "../../../../lib/Command/Command.js";
import { VERSION } from "../../../../config/app";

new Command({
  name: "version",
  description: "Get Current Version",
  aliases: ["v"],
}).executes((ctx) => {
  ctx.reply(`Current Rubedo Version: ${VERSION}`);
});
