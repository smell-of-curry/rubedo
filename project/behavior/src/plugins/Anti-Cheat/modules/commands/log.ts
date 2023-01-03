import { PREFIX } from "../../../../config/commands";
import { ArgumentTypes, Command } from "../../../../lib/Command/Command";
import { TABLES } from "../../../../database/tables";
import { getRole } from "../../utils";
import { Log } from "../models/Log";

function timeDifference(previous: number) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = Date.now() - previous;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return "approximately " + Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return "approximately " + Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return "approximately " + Math.round(elapsed / msPerYear) + " years ago";
  }
}

const root = new Command({
  name: "log",
  description: "Manages the log command",
  requires: (player) => getRole(player) == "admin",
});

root
  .literal({
    name: "add",
    description: "Adds a new log",
  })
  .string("message")
  .executes((ctx, message) => {
    new Log({ message: message });
    ctx.reply(`§aAdded new log: ${message}`);
  });

root
  .literal({
    name: "getAll",
    description: "Gets all logs sorted in descending",
  })
  .int("page")
  .array("order", ["ascending", "descending"] as const)
  .executes((ctx, page, order) => {
    const allLogs = Object.entries(TABLES.logs.collection()).sort((a, b) =>
      order == "ascending"
        ? parseInt(b[0]) - parseInt(a[0])
        : parseInt(a[0]) - parseInt(b[0])
    );
    if (allLogs.length == 0) return ctx.reply(`§cNo Logs have been made!`);
    const maxPages = Math.ceil(allLogs.length / 8);
    if (page > maxPages) page = maxPages;
    ctx.reply(
      `§2--- Showing logs page ${page} of ${maxPages} (${PREFIX}log getAll <page: int>) ---`
    );

    for (const [key, value] of allLogs.slice(page * 8 - 8, page * 8)) {
      ctx.reply(`${timeDifference(parseInt(key))}: ${value.message}`);
    }
  });

root
  .literal({
    name: "getPlayersLogs",
    description: "Gets all logs associated with a player",
  })
  .argument(new ArgumentTypes.playerName())
  .int("page")
  .array("order", ["ascending", "descending"] as const)
  .executes((ctx, playerName, page, order) => {
    const allLogs = Object.entries(TABLES.logs.collection())
      .filter((v) => v[1].playerName == playerName)
      .sort((a, b) =>
        order == "ascending"
          ? parseInt(b[0]) - parseInt(a[0])
          : parseInt(a[0]) - parseInt(b[0])
      );
    if (allLogs.length == 0)
      return ctx.reply(`§cNo Logs exists for "${playerName}"!`);
    const maxPages = Math.ceil(allLogs.length / 8);
    if (page > maxPages) page = maxPages;
    ctx.reply(
      `§2--- Showing logs for "${playerName}" page ${page} of ${maxPages} ---`
    );

    for (const [key, value] of allLogs.slice(page * 8 - 8, page * 8)) {
      ctx.reply(`${timeDifference(parseInt(key))}: ${value.message}`);
    }
  });

root
  .literal({
    name: "getProtectionLogs",
    description: "Gets all logs associated with a protection",
  })
  .string("protection")
  .int("page")
  .array("order", ["ascending", "descending"] as const)
  .executes((ctx, protection, page, order) => {
    const allLogs = Object.entries(TABLES.logs.collection())
      .filter((v) => v[1].protection == protection)
      .sort((a, b) =>
        order == "ascending"
          ? parseInt(b[0]) - parseInt(a[0])
          : parseInt(a[0]) - parseInt(b[0])
      );
    if (allLogs.length == 0)
      return ctx.reply(`§cNo Logs exists for protection: "${protection}"!`);
    const maxPages = Math.ceil(allLogs.length / 8);
    if (page > maxPages) page = maxPages;
    ctx.reply(
      `§2--- Showing logs for Protection: "${protection}" page ${page} of ${maxPages} ---`
    );

    for (const [key, value] of allLogs.slice(page * 8 - 8, page * 8)) {
      ctx.reply(`${timeDifference(parseInt(key))}: ${value.message}`);
    }
  });

root
  .literal({
    name: "clearAll",
    description: "Clears all logs",
  })
  .executes((ctx) => {
    TABLES.logs.clear();
    ctx.reply(`§aCleared All logs!`);
  });
