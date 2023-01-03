import { Events, Player, system, world } from "@minecraft/server";
import { TABLES } from "../../../../database/tables.js";
import { EventsReturnType, IProtectionsConfig } from "../../../../types.js";
import { PROTECTIONS } from "../../protections.js";
import { clearForEachValidPlayer, forEachValidPlayer } from "../../utils.js";

/**
 * A protection instance
 */
export class Protection<Config = IProtectionsConfig> {
  /**
   * Events that this is subscribed to
   */
  private events: {
    -readonly [Key in keyof Events]+?: {
      /**
       * Callback this event is to run.
       */
      callback: ReturnType<Events[Key]["subscribe"]>;
      /**
       * If this has been triggered on world.events
       */
      triggered: boolean;
    };
  };

  /**
   * List of events that this protection is scheduled
   */
  private schedules: {
    /**
     * Callback to run
     */
    callback: () => void;
    /**
     * Delay in ticks
     */
    tickInterval: number;
    /**
     * If null, this event hasn't been registered by {@link system.runSchedule}
     * if {@link number}, the event has been registered and this key can be used to {@link system.clearRunSchedule}
     */
    runScheduleId: number | null;
  }[];

  /**
   * A list of forEachValidPlayers keys used to unsubscribe
   */
  private forEachValidPlayers: {
    /**
     * Callback to run
     * @param player
     * @returns
     */
    callback: (player: Player) => void;
    /**
     * Delay in ticks
     */
    delay: number;
    /**
     * If null, this event hasn't been registered by {@link forEachValidPlayers}
     * if {@link number}, the event has been registered and this key can be used to unsubscribe
     */
    key: number | null;
  }[];

  /**
   * Callback to run on enable
   */
  private onEnableCallback: () => void | undefined;

  /**
   * Callback to run on disable
   */
  private onDisableCallback: () => void | undefined;

  /**
   * If this protection is enabled
   */
  private isEnabled: boolean;

  /**
   * The default config object
   */
  configDefault: {
    [key: string]: {
      description: string;
      defaultValue: string | boolean | number;
    };
  };

  /**
   * Creates a new protection module
   */
  constructor(
    public name: string,
    public description: string,
    public iconPath: string,
    public isEnabledByDefault: boolean
  ) {
    this.name = name;
    this.description = description;
    this.iconPath = iconPath;
    this.configDefault = {};
    this.isEnabled = false;
    this.isEnabledByDefault = isEnabledByDefault;
    // ---- events
    this.events = {};
    this.schedules = [];
    this.forEachValidPlayers = [];
    // Save protection
    PROTECTIONS[this.name] = this;
  }

  /**
   * Sets the config to a typed object
   * @param data typed object
   * @returns
   */
  setConfigDefault(data: {
    [key: string]: {
      description: string;
      defaultValue: string | boolean | number;
    };
  }): Protection<Config> {
    this.configDefault = data;
    TABLES.protections.hasSync(this.name).then((v) => {
      if (v) return;
      let saveData: IProtectionsConfig = {
        enabled: true,
      };
      for (const key of Object.keys(data)) {
        saveData[key] = data[key as keyof typeof data].defaultValue;
      }
      TABLES.protections.set(this.name, saveData);
    });
    return this;
  }

  /**
   * Gets the config data
   * @returns Config
   */
  getConfig(): Config {
    let config = TABLES.protections.get(this.name);
    if (!config) config = { enabled: this.isEnabled };
    return config as Config;
  }

  async setConfig(data: Config) {
    return TABLES.protections.set(this.name, data as IProtectionsConfig);
  }

  /**
   * Triggers a change to a activate this module or not.
   * @param enabled if this protection is enabled or not
   */
  private triggerChange(enabled: boolean) {
    if (enabled) {
      this.isEnabled = true;
      // Enable this protection
      this.onEnableCallback?.();
      for (const [key, value] of Object.entries(this.events)) {
        if (value.triggered) continue;
        let callback = world.events[key as keyof Events].subscribe(
          // @ts-ignore
          value.callback
        );
        value.triggered = true;
        value.callback = callback;
      }
      for (const v of this.forEachValidPlayers) {
        if (v.key) continue;
        let key = forEachValidPlayer(v.callback, v.delay);
        v.key = key;
      }
      for (const v of this.schedules) {
        if (v.runScheduleId) continue;
        let runScheduleId = system.runSchedule(v.callback);
        v.runScheduleId = runScheduleId;
      }
    } else {
      this.isEnabled = false;
      // Disable this protection
      this.onDisableCallback?.();
      for (const [key, value] of Object.entries(this.events)) {
        if (!value.triggered) continue;
        // @ts-ignore
        world.events[key as keyof Events].unsubscribe(value.callback);
        value.triggered = false;
      }
      for (const v of this.forEachValidPlayers) {
        if (!v.key) continue;
        clearForEachValidPlayer(v.key);
        v.key = null;
      }
      for (const v of this.schedules) {
        if (!v.runScheduleId) continue;
        system.clearRunSchedule(v.runScheduleId);
        v.runScheduleId = null;
      }
    }
  }

  /**
   * Runs a callback once this protection is activated
   * @param callback function to run
   */
  onEnable(callback: () => void): Protection<Config> {
    this.onEnableCallback = callback;
    return this;
  }

  /**
   * Runs a callback once this protection is disabled
   * @param callback function to run
   */
  onDisable(callback: () => void): Protection<Config> {
    this.onDisableCallback = callback;
    return this;
  }

  /**
   * Subscribes to a worldEvent
   * @param id event id to subscribe
   * @param callback what to run on event callback
   * @returns this
   */
  subscribe<T extends keyof Events>(
    id: T,
    callback: EventsReturnType<T>
  ): Protection<Config> {
    this.events[id] = {
      callback: callback,
      triggered: false,
    };
    return this;
  }

  /**
   * Schedules a callback to be run every x number of ticks
   * @param callback callback
   * @param tickInterval ticks
   */
  runSchedule(callback: () => void, tickInterval?: number): Protection<Config> {
    this.schedules.push({
      callback: callback,
      tickInterval: tickInterval,
      runScheduleId: null,
    });
    return this;
  }

  /**
   * Callback for each valid players
   * @param callback
   * @param delay
   */
  forEachValidPlayer(
    callback: (player: Player) => void,
    delay: number = 0
  ): Protection<Config> {
    this.forEachValidPlayers.push({
      callback: callback,
      delay: delay,
      key: null,
    });
    return this;
  }

  /**
   * Enables this protection
   */
  enable() {
    this.triggerChange(true);
  }

  /**
   * Disables this protection
   */
  disable() {
    this.triggerChange(false);
  }
}
