import { TABLES } from "../../../../database/tables";
import type { LogData } from "../../../../types";

export class Log {
  /**
   * The data on this Log
   */
  data: LogData;
  constructor(data: LogData) {
    this.data = data;
    console.warn(`[LOG]: ${data.message}`);
    TABLES.logs.set(Date.now().toString(), data);
  }
}
