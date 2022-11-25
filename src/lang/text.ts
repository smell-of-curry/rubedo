export const text = {
  "api.name": () => "Smelly API",
  "api.error.unknown": () => "An unknown error has occurred.",
  "api.database.error.table_name": (a: string, b: number) =>
    `The display name ${a} is too long for an objective, it can be at most ${b} characters long`,
  "api.utilities.formatter.error.ms": (a: string) =>
    `${a} is not a string or a number`,
  "api.Providers.form.invalidType": (a: string, b: string) =>
    `Type ${a} is not a valid type to add a ${b}`,
  "api.Providers.form.invalidFormtype": (a: string, b: string) => {
    `The type ${a} is not a valid type, valid types: ${JSON.stringify(b)}`;
  },
  "api.ChestGUI.error.pagenotfound": (a: string) => `Page ${a} not found!`,
  "modules.protections.cps.clickingToFast": () =>
    `You are clicking to fast! Please click slower!`,
  "modules.managers.mute.isMuted": () =>
    `You are muted and cannot send messages please try again later`,
  "modules.commands.ban.reply": (
    playerName: string,
    duration: string,
    reason: string = ""
  ) =>
    `§cBanned §f"§a${playerName}§f" §cfor ${duration} Because: "${
      reason ?? "No reason Provided"
    }" §aSuccessfully`,
  "lockdown.kick.message": () => [
    `§cYou have been kicked!`,
    `§aReason: §fServer is currently under LockDown`,
    `§fServer will be up soon, Try to join later`,
  ],
  "commands.ban.list.player": (name: string, reason: string, expire: string) =>
    `- "${name}" Because: ${reason}, Expiry ${expire}`,
  "commands.freeze.list.player": (name: string, reason: string) =>
    `- "${name}" Because: ${reason}`,
  "commands.mutes.list.player": (
    name: string,
    reason: string,
    expire: string
  ) => `- "${name}" Because: ${reason}, Expiry: ${expire}`,
  "commands.lockdown.confirm": "Are you sure you want to lockdown the server, this will kick all active players and all players who try to join who are not admin"
};
