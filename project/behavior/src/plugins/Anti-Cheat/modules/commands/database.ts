import { Command } from "../../../../lib/Command/Command";
import { TABLES } from "../../../../database/tables";
import { getRole } from "../../utils";

const root = new Command({
  name: "database",
  description: "Interacts with SA Database",
  aliases: ["db"],
  requires: (player) => getRole(player) == "admin",
});

root
  .literal({
    name: "get",
  })
  .string("table")
  .string("key")
  .executes((ctx, table, key) => {
    try {
      const data = TABLES[table as keyof typeof TABLES].get(key);
      if (data) {
        ctx.reply(JSON.stringify(data));
      } else {
        ctx.reply(`No data could be found for key ${key}`);
      }
    } catch (error) {
      ctx.reply(error + error.stack);
    }
  });

root
  .literal({
    name: "set",
  })
  .string("table")
  .string("key")
  .string("value")
  .executes((ctx, table, key, value) => {
    try {
      TABLES[table as keyof typeof TABLES].set(key, value);
      ctx.reply(`Set Key: "${key}", to value: "${value}" on table: "${table}"`);
    } catch (error) {
      ctx.reply(error + error.stack);
    }
  });

root
  .literal({
    name: "clear",
  })
  .string("table")
  .executes((ctx, table) => {
    try {
      TABLES[table as keyof typeof TABLES].clear();
      ctx.reply(`Cleared Table ${table}`);
    } catch (error) {
      ctx.reply(error + error.stack);
    }
  });

root
  .literal({
    name: "keys",
    description: "Returns all keys on a database",
  })
  .string("table")
  .executes((ctx, table) => {
    try {
      const keys = TABLES[table as keyof typeof TABLES].keys();
      ctx.reply(`Keys on database: ${table}: ${keys}`);
    } catch (error) {
      ctx.reply(error + error.stack);
    }
  });

root
  .literal({
    name: "values",
    description: "Returns all values on a database",
  })
  .string("table")
  .executes((ctx, table) => {
    try {
      const values = TABLES[table as keyof typeof TABLES].values();
      ctx.reply(
        `Values on database: ${table}: ${JSON.stringify(values, null, 2)}`
      );
    } catch (error) {
      // likely occurs when table is empty
      if (error instanceof TypeError) {
        ctx.reply(`No values on database ${table}`);
      } else {
        ctx.reply(error + error.stack);
      }
    }
  });
