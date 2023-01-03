import { Player } from "@minecraft/server";
import { ActionForm } from "./ActionForm";
import { MessageForm } from "./MessageForm";
import { ModalForm } from "./ModelForm";

export class FormCallback {
  /**
   * form that was used in this call
   */
  private form: ActionForm | MessageForm | ModalForm<any>;
  /**
   * player that this form used
   */
  private player: Player;

  /**
   * the function that was called
   */
  private callback: () => void;

  /**
   * Creates a new form callback instance that can be used by
   * buttons, and args to run various functions
   * @param form form that is used in this call
   */
  constructor(
    form: ActionForm | MessageForm | ModalForm<any>,
    player: Player,
    callback: any
  ) {
    this.form = form;
    this.player = player;
    this.callback = callback;
  }

  /**
   * Reshow the form and shows the user a error message
   * @param message error message to show
   */
  error(message: string) {
    new MessageForm("Error", message)
      .setButton1("Return to form", () => {
        this.form.show(this.player, this.callback);
      })
      .setButton2("Cancel", null)
      .show(this.player);
  }
}
