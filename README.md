# Rubedo Version 2.5.5-beta

Welcome to Rubedo, an anti-cheat designed to protect your world from cheaters. Rubedo is designed to be smarter than cheaters by giving users access to advanced tools to protect
their world from hacked items, nuker, crashes, griefing, and so much more. Rubedo makes it possible to protect permissions and manage performance with the click of a button!

# Getting Started:

Upon applying the pack and joining the world the operator should run the command below which gives you **Admin** permissions.
The command gives full access to Rubedo. Ideally, the owner should run this command

> **Warning** **: THIS CAN ONLY BE RUN ONCE!! THE USER CAN GIVE OTHERS ADMIN PERMS VIA `-role`**

```bash
/function start
```

## Commands:

See all commands in-game by running **-help** in chat, Please note the permissions
on each command before using it.

> **Note**: PlayerName Argument requires quotes around name\*\*

### -help `[]`

> **Note**: the help command will only show commands that are available at your role level.

```bash
-help <page: number>
-help <command: string>
```

### -ping `[]`

Gets the current ping of the server

```bash
-ping <page: number>
```

### -version `[]`

Gets the current version of Rubedo

```bash
-version
```

### -role `["owner", "admin"]`

This command allows you to manage permissions of players in this world, the command
CAN acess offline players.

```bash
-role set <playerName: PlayerName> <role: "member" | "moderator" | "admin" | "builder">
```

```bash
-role set "Smell of curry" "admin"
```

Then to view a set role simply:

```bash
-role get <playerName: PlayerName>
```

### -ban `["admin"]`

```bash
-ban add <playerName: PlayerName>
-ban add <playerName: PlayerName> <duration: Duration>
-ban add <playerName: PlayerName> <duration: Duration> <reason: string>
-ban remove <playerName: PlayerName>
-ban list
```

```bash
-ban "Smell of curry"
-ban "Smell of curry" 10 hours
-ban "Smell of curry" 20 mins "Hes too good"
```

### -kick `["admin"]`

Kicks player from game

```bash
-kick <player: Player> <reason: string>
```

```bash
-kick "Smell of curry" "Bad boi"
```

### -freeze `["admin"]`

This stops the player from moving

```bash
-freeze add <playerName: PlayerName> <reason: string>
-freeze remove <playerName: PlayerName>
-freeze list
```

```bash
-freeze "Smell of curry" "Hacking"
```

### -vanish `["admin"]`

Toggles vanish mode, also can say messages in chat making it seem like you left the game.

![shows player left game](https://i.ibb.co/KrnnpFj/sdsdsd-Capture2sa.png)
![shows player joined game](https://i.ibb.co/9HGDW3L/Csdsdsdsdapture.png)

**Param**: `say`: this will toggle vanish and say something in chat

```bash
-vanish
-vanish <say: boolean>
```

```bash
-vanish
-vanish true
```

### -mute `["admin", "moderator"]`

```bash
-mute add <player: playerName> <duration: Duration> <reason: string>
-mute remove <player: playerName>
- mute list
```

```bash
-mute "Smell of curry" 5 hrs "Sending bad stuff in chat"
```

### -ecwipe `["admin"]`

Clears a player enderchest

```bash
-ecwipe <player: Player>
```

```bash
-ecwipe "Smell of curry"
```

### -npc `["admin"]`

> **Note**: This will spawn an npc that will NOT get despawned by `cbe` protection

```bash
-npc
```

### -lockdown `["admin"]`

Toggles the server lockdown. A server that is locked down allows noone to join unless they
are admin, also it will kick all players that are currently on, displaying them with a custom
kick message showing the server is locked down.

```bash
-lockdown
```

### -settings `["admin"]`

Opens the settings menu for the player allowing them to edit rubedos features.

```bash
-settings
```

### -database `["admin"]`

Manages Databases in rubedo, this should only be used by advanced users.

```bash
-database get <table: string> <key: string>
-database set <table: string> <key: string> <value: string>
-database clear <table: string>
-database keys <table: string>
-database values <table: string>
```

Example

```bash
-database get "config" "cbe_config"
```

```bash
-database set "config" "appeal_link" "https://discord.gg/sjdhsd"
```

```bash
-database clear "ids"
```

```bash
-database keys "ids"
```

```bash
-database values "npcs"
```

### -log `["admin"]`

Manages logs in the server

```bash
-log add <message: string>
-log getAll <page: int> <order: ascending | descending>
-log getPlayersLogs <playerName: playerName> <page: int> <order: ascending | descending>
-log getProtectionLogs <protection: string> <page: int> <order: ascending | descending>
-log clearAll
```

Example

```bash
-log add "Smell of curry did something bad"
```

```bash
-log getAll 1 ascending
```

```bash
-log getPlayersLogs "Smell of curry" 1 ascending
```

```bash
-log getProtectionLogs "unobtainable" 1 ascending
```

```bash
-log clearAll
```

## Regions

Regions are an important part of rubedo. Regions protect land like spawn, parks, forests, simply anything you
want to protect players. Regions are really powerfull because they are configurable and can stop
all actions that happen in an area.

### Create a Region: `["admin"]`

```bash
-region add <from_x: int> <from_z: int> <to_x:int> <to_z: int>
```

```bash
-region add 20 90 300 900
```

### Remove a Region `["admin"]`

> **Note** This command selects the region that the player is currently standing in.

```bash
-region remove
```

Or You can remove all regions using:

```bash
-region removeAll
```

### List all regions `["admin"]`

```bash
-region list
```

### Changing Region Permissions `["admin"]`

> **Note**: Default Permissions are stored here: [`src\config\region.ts`](https://github.com/smell-of-curry/rubedo/blob/main/src/config/region.ts)

> **Note**: The `-region permission` command selects the current region the command executer is standing in

```bash
-region permission set <key: doorsAndSwitches | openContainers | pvp> <value: boolean>
```

```
-region permission set pvp false
-region permission set openContainers false
-region permission set doorsAndSwitches true
```

#### Managing what mobs can spawn `["admin"]`

```bash
-region permission entities add <entity: string>
-region permission entities remove <entity: string>
```

```bash
-region permission entities add "minecraft:cow"
-region permission entities remove "minecraft:cow"
```

### List the current permissions for this region `["admin"]`

```bash
-region permission list
```

## Modules:

- **Anti CBE**: Prevents users from using CBE (Commandblock Exploits) which is done by checking the inventory every tick for these illegal items and clearing it.

- **Anti Crasher**: patches a crashing method (typically used by Horion) that teleports a user 30 million blocks far and kicks a user hopefully preventing the crash.

- **Anti Illegal Enchants**: Checks if a player has a illegal enchantment on a item in there inventory.

- **Anti Gamemode**: Removes creative and clears the user inventory if the user is not an authorized user.

  > **Note**: **THIS IGNORES BUILDERS**

- **Anti NameSpoof**: Checks if player has played before with a diffrent name. WARNING when converting worlds into bds clear your database first.

- **Anti Nuker**: works by logging the placement of blocks done by the player and detects if the next block break is done impossibly fast (50 milliseconds) then we cancel the breaking event.

- **ban bad Blocks/items**: Checks if player has a banned item in there inventory, or if a player places a banned block. This list can be configurable in the `-settings`

# View Player's inventories & Ender Chests

First, you will need to make sure you have admin permission on your server, look at [Permissions](#permissions) for more details

Next give yourself `Rubedo:gui`
by typing in chat:

```bash
/give @s `Rubedo:gui`
```

Next Open your GUI and you should be prompted with this screen

![gui screen that shows a ender chest in middle](https://i.ibb.co/Bf0dDVN/Captusdsdsdsdre.png)

Next to view a list of players click on the ender chest, then you should be
prompted with this screen

![gui screen that shows a list of all players in the world](https://i.ibb.co/QjQXKP0/2Capture.png)

This screen should show each player in the world with a player head with their name as the nameTag
Click a player you want to view, then you will be shown their inventory:

![gui screen that shows a players inventory](https://i.ibb.co/Hg1fd9b/3Capture.png)

When clicking on items in the player's inventory it will remove them from the player's inventory and give
you the item

> **Note**: to view the players ender chest click the ender chest icon at the bottom of the gui screen

Once you open up the player's ender chest it should look like this:

![gui screen that shows a players ender chest](https://i.ibb.co/yQWnX7v/4Capture.png)

When clicking on items it will remove those items from their ender chest and give them to you

> **Note**: THIS SYSTEM **CANNOT** GRAB ANY NBT OF THE ITEM. ONLY THE ITEM ID

# Command Arguments

### **PlayerName**

The playerName argument is a very special argument, it allows players to input playersNames and use it in commands

> **Note**: The argument allowes you to input a player name. If the players name has spaces make sure to include quotes
> around the name

> **Warning** **: This argument can throw errors if a player has never joined the server before**

Syntax:

```batch
playerNamewithNoSpaces
"Player name with spaces"
```

### **Player**

The `Player` argument type is like `PlayerName` but `PlayerName` can call be used on any player that has ever joined the world
while `Player` can only access players that are in the current game

> **Warning** **: This argument can throw errors if a player is not currently in the game**

Syntax:

```batch
playerNamewithNoSpaces
"Player name with spaces"
```

### **Duration**

The duration argument allows users to input time statments that allow commands like `ban`, `mute` and much more to understand
how long you want a duration to last

The duration argument consits of an array of `DurationArgumentTypes`.
A `DurationArgumentTypes` consists of a `number` and `unit`

`unit`'s can be one of `"y" | "w" | "d" | "h" | "m" | "s" | "ms"`

Where:
`"y"` is years  
`"w"` is weeks  
`"d"` is days  
`"h"` is hours  
`"m"` is minutes  
`"s"` is seconds  
`"ms"` is milliseconds

Syntax:

`10d` - 10 days  
`4d,5m` - 4 days and 5 minutes  
`5h,30m` - 5 hours and 30 minutes  
`100000d` - 100000 days  
`2y,5d,8s` - 2 years 5 days and 8 seconds  
`4h,3m,5s,20ms` - 4 hours, 3 minutes, 5 seconds and 20 miliseconds

## Configuration

Rubedo has made it so easy to edit all of its config files in-game. Most Anti cheats make it so
you have to know how to edit files and make packs, but with Rubedo you can do it all in-game
with the `-settings` command!

Once you run:

```bash
-settings
```

in chat you will be prompted to close your chat screen. Once you do so a form should be prompted up
on your screen. In this screen you can edit things like AutoMod, Banned Items, Banned Blocks, Enchantments, And the Appeal Link!

## Support

As Rubedo is Still in beta, there might be bugs that you could face. If you need support PLEASE Join the [Discord](https://discord.gg/a9MjfydsFz) and submit your problems there
