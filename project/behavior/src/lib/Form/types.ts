export type ButtonCallback = () => void;

export interface IActionFormButton {
  /**
   * Text that gets displayed on the button
   */
  text: string;
  /**
   * The icon that is showed with this button
   */
  iconPath?: string;
  /**
   * What gets called when this gets clicked
   */
  callback?: ButtonCallback;
}

export interface IMessageFormButton {
  /**
   * Text that gets displayed on the button
   */
  text: string;
  /**
   * What gets called when this gets clicked
   */
  callback?: ButtonCallback;
}

export interface IModalFormArg {
  /**
   * What this form arg is
   */
  type: "dropdown" | "slider" | "textField" | "toggle";
  /**
   * if this option is a dropdown this is
   * the Values that this dropdown can have
   */
  options?: string[];
}

export type AppendFormField<Base, Next> = Base extends (
  ...args: infer E
) => infer R
  ? (...args: [...E, Next]) => R
  : never;

type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

export type Range<F extends number, T extends number> =
  | Exclude<Enumerate<T>, Enumerate<F>>
  | T;
