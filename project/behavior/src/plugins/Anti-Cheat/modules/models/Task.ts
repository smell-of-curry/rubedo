import type { ROLES } from "../../../../types";
import { TABLES } from "../../../../database/tables";
import type { IChangePlayerRoleData } from "../../../../types";

export class ChangePlayerRoleTask {
  /**
   * The name of the player
   */
  playerName: string;
  /**
   * The role that the player should be set to
   */
  role: keyof typeof ROLES;

  /**
   *  gets all tasks that are present
   * @returns all tasks
   */
  static getTasks(): Array<IChangePlayerRoleData> {
    return TABLES.tasks.get("changePlayerRole") ?? [];
  }

  /**
   * Gets the role this player needs to be set to
   * @param playerName name
   */
  static getPlayersRoleToSet(playerName: string): keyof typeof ROLES | null {
    const tasks = ChangePlayerRoleTask.getTasks();
    return tasks.find((t) => t.playerName == playerName)?.role;
  }

  constructor(playerName: string, role: keyof typeof ROLES) {
    let tasks = ChangePlayerRoleTask.getTasks();
    tasks.push({ playerName: playerName, role: role });
    TABLES.tasks.set("changePlayerRole", tasks);
  }
}
