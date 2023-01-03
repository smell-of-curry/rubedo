import { Command } from "../../../../lib/Command/Command.js";
import { system } from "@minecraft/server";

async function getServerTPS(): Promise<number> {
  let startTime = Date.now();
  let ticks = 0;
  return new Promise((resolve) => {
    let s = system.runSchedule(() => {
      if (Date.now() - startTime < 1000) {
        ticks++;
      } else {
        system.clearRunSchedule(s);
        resolve(ticks);
      }
    });
  });
}

new Command({
  name: "ping",
  description: "Returns the current Ticks Per Second of the servers ping",
}).executes(async (ctx) => {
  let ticks = await getServerTPS();
  ctx.reply(
    `§aCurrent Ticks Per Second: ${
      ticks > 18 ? "§f{ §aGood" : ticks > 13 ? "§f{ §eOk" : "§f{ §cSevere"
    } ${ticks} §f}`
  );
});
