import { Location, Player } from "@minecraft/server";
import {
  LiteralArgumentType,
  IArgumentType,
  LocationArgumentType,
  StringArgumentType,
  IntegerArgumentType,
  ArrayArgumentType,
  BooleanArgumentType,
} from "./ArgumentTypes.js";
import { CommandCallback } from "./Callback.js";
import { COMMANDS } from "./index.js";
import type { AppendArgument, ICommandData, ArgReturn } from "./types";
export { ArgumentTypes } from "./ArgumentTypes";

export class Command<
  Callback extends Function = (ctx: CommandCallback) => void
> {
  /**
   * The Arguments on this command
   */
  children: Command<any>[];

  /**
   * Function to run when this command is called
   */
  callback: Callback;

  constructor(
    public data: ICommandData,
    public type?: IArgumentType,
    public depth: number = 0,
    public parent?: Command<any>
  ) {
    if (!data.requires) data.requires = (player: Player) => true;
    this.data = data;
    this.type = type ?? new LiteralArgumentType(this.data.name);
    this.children = [];
    this.depth = depth;
    this.parent = parent;
    this.callback = null;

    COMMANDS.push(this);
  }

  /**
   * Adds a ranch to this command of your own type
   * @param type a special type to be added
   * @returns new branch to this command
   */
  argument<T extends IArgumentType>(type: T): ArgReturn<Callback, T["type"]> {
    const cmd = new Command<AppendArgument<Callback, T["type"]>>(
      this.data,
      type,
      this.depth + 1,
      this
    );
    this.children.push(cmd);
    return cmd;
  }

  /**
   * Adds a branch to this command of type string
   * @param name name this argument should have
   * @returns new branch to this command
   */
  string(name: string): ArgReturn<Callback, string> {
    return this.argument(new StringArgumentType(name));
  }

  /**
   * Adds a branch to this command of type string
   * @param name name this argument should have
   * @returns new branch to this command
   */
  int(name: string): ArgReturn<Callback, number> {
    return this.argument(new IntegerArgumentType(name));
  }

  /**
   * Adds a branch to this command of type string
   * @param name name this argument should have
   * @returns new branch to this command
   */
  array<T extends ReadonlyArray<string>>(
    name: string,
    types: T
  ): ArgReturn<Callback, T[number]> {
    return this.argument(new ArrayArgumentType(name, types));
  }

  /**
   * Adds a branch to this command of type string
   * @param name name this argument should have
   * @returns new branch to this command
   */
  boolean(name: string): ArgReturn<Callback, boolean> {
    return this.argument(new BooleanArgumentType(name));
  }

  /**
   * Adds a argument to this command to add 3 parameters with location types and to return a Location
   * @param name name this argument  should have
   * @returns new branch to this command
   */
  location(name: string): ArgReturn<Callback, Location> {
    const cmd = this.argument(new LocationArgumentType(name));
    if (!name.endsWith("*")) {
      const newArg = cmd.location(name + "_y*").location(name + "_z*");
      //@ts-ignore
      return newArg;
    }
    //@ts-ignore
    return cmd;
  }

  /**
   * Adds a subCommand to this argument
   * @param name name this literal should have
   * @returns new branch to this command
   */
  literal(data: ICommandData): Command<Callback> {
    const cmd = new Command<Callback>(
      data,
      new LiteralArgumentType(data.name),
      this.depth + 1,
      this
    );
    this.children.push(cmd);
    return cmd;
  }

  /**
   * Registers this command and its appending arguments
   * @param callback what to run when this command gets called
   */
  executes(callback: Callback): Command<Callback> {
    this.callback = callback;
    return this;
  }
}
