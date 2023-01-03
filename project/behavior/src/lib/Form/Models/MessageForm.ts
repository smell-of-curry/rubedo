import { Player } from "@minecraft/server";
import { MessageFormData } from "@minecraft/server-ui";
import { TIMEOUT_THRESHOLD } from "../../../config/form";
import type { ButtonCallback, IMessageFormButton } from "../types";

export class MessageForm {
  /**
   *  the title that this form should have
   */
  title?: string;
  /**
   * extra text that should be displayed in the form
   */
  body?: string;
  /**
   * The default minecraft form this form is based on
   */
  private form: MessageFormData;
  /**
   * the first button of the dialog.
   */
  private button1: IMessageFormButton;
  /**
   * the second button of the dialog.
   */
  private button2: IMessageFormButton;
  /**
   * The amount of times it takes to show this form in ms
   * if this value goes above 200 it will time out
   */
  private triedToShow: number;

  /**
   * Creates a new form to be shown to a player
   * @param title the title that this form should have
   * @param body extra text that should be displayed in the form
   */
  constructor(title?: string, body?: string) {
    this.title = title;
    this.body = body;
    this.form = new MessageFormData();

    if (title) this.form.title(title);
    if (body) this.form.body(body);

    this.triedToShow = 0;
  }

  /**
   * Method that sets the text for the first button of the dialog.
   * @param text text to show on this button
   * @param callback what happens when this button is clicked
   * @example ```
   * setButton1("settings", () => {})
   * ```
   */
  setButton1(text: string, callback?: ButtonCallback): MessageForm {
    this.button1 = { text: text, callback: callback };
    this.form.button1(text);
    return this;
  }

  /**
   * Method that sets the text for the second button of the dialog.
   * @param text text to show on this button
   * @param callback what happens when this button is clicked
   * @example ```
   * setButton2("settings", () => {})
   * ```
   */
  setButton2(text: string, callback?: ButtonCallback): MessageForm {
    this.button2 = { text: text, callback: callback };
    this.form.button2(text);
    return this;
  }

  /**
   * Shows this form to the player
   * @param player player to show to
   */
  show(player: Player): void {
    this.form.show(player).then((response) => {
      if (response.canceled) {
        if (response.cancelationReason == "userBusy") {
          // check time and reshow form
          if (this.triedToShow > TIMEOUT_THRESHOLD)
            return player.tell(
              `§cForm Timeout: tried to show form, but you were busy (close chat after running command)`
            );
          this.triedToShow++;
          this.show(player);
        }
        return;
      }
      if (response.selection == 1) this.button1?.callback?.();
      if (response.selection == 0) this.button2?.callback?.();
    });
  }
}
