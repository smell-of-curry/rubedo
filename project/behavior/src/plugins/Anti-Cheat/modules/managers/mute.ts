import { Mute } from "../models/Mute.js";
import { text } from "../../../../lang/text.js";
import { TABLES } from "../../../../database/tables.js";
import { beforeChat } from "../../../../lib/Events/beforeChat.js";

beforeChat.subscribe((data) => {
  const muteData = Mute.getMuteData(data.sender);
  if (!muteData) return;
  if (muteData.expire && muteData.expire < Date.now())
    return TABLES.mutes.delete(data.sender.name);
  data.cancel = true;
  data.sender.tell(text["modules.managers.mute.isMuted"]());
});
