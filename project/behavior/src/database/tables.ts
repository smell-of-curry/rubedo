import type {
  IRegionDB,
  IMuteData,
  IBanData,
  IFreezeData,
  INpcLocation,
  LogData,
  IProtectionsConfig,
} from "../types";
import type { ROLES } from "../types";
import { Database } from "./Database";

/**
 * All the Database tables that are created
 */
export const TABLES = {
  config: new Database<string, any>("config"),
  freezes: new Database<string, IFreezeData>("freezes"),
  mutes: new Database<string, IMuteData>("mutes"),
  bans: new Database<string, IBanData>("bans"),
  regions: new Database<string, IRegionDB>("regions"),
  roles: new Database<string, keyof typeof ROLES>("roles"),
  tasks: new Database<string, any>("tasks"),
  npcs: new Database<string, INpcLocation>("npcs"),
  ids: new Database<string, string>("ids"),
  logs: new Database<string, LogData>("logs"),
  protections: new Database<string, IProtectionsConfig>("protections"),
};
