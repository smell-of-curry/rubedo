import { world, BeforeChatEvent } from "@minecraft/server";
import { PREFIX } from "../../config/commands";

type beforeChatCallback = (arg: BeforeChatEvent) => void;

const CALLBACKS: {
  [key: number]: {
    callback: beforeChatCallback;
  };
} = {};

world.events.beforeChat.subscribe((data) => {
  if (data.message.startsWith(PREFIX)) return; // This is a command
  for (const callback of Object.values(CALLBACKS)) {
    callback.callback(data);
  }
});

export class beforeChat {
  /**
   * Subscribes to a callback to get notified when a chat is sent that is not a command
   * @param callback what to be called when one of these entity's inventory changes
   * @returns the id that is used to unsubscribe
   */
  static subscribe(callback: beforeChatCallback): number {
    const key = Date.now();
    CALLBACKS[key] = { callback: callback };
    return key;
  }
  static unsubscribe(key: number): void {
    delete CALLBACKS[key];
  }
}
