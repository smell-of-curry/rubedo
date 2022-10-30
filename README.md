# Rubedo Version 2.4.6-beta

Welcome to Rubedo, Rubedo is a brand new Anti-cheat designed for Realms, Servers, Worlds, and anyone who wants to protect their worlds from Hackers! Rubedo Uses Minecraft's Most advanced functionality which includes [Gametest](https://learn.microsoft.com/en-us/minecraft/creator/documents/gametestbuildyourfirstgametest).

![Rubedo thumbnail](https://api.mcpedl.com/storage/submissions/92154/100/anticheat_1-520x245.png)

## Features

Rubedo is coded in the Brand new Smelly API V4. This API is extremely Powerful it builds and expands all the possibilities making this anti-cheat possible

- Check out Smelly API: https://github.com/smell-of-curry/Smelly-API

# Permissions:

As Rubedo is top-of-the-line, permissions and security is our main priority.

### First-time usage

Upon applying the pack and joining the world the operator should run the command below which gives you **Admin** permissions.

$$\color{red} \fcolorbox{red}{white} { THIS CAN ONLY BE RUN ONCE!! THE USER CAN GIVE OTHERS ADMIN PERMS VIA -role} $$

```bash
/function start
```

The command makes the user an `admin` and gives them full access to Rubedo. Ideally, the owner should run this command
### changing a user's permission
To change permissions simply run this command

```bash
-role set <player: String> <role: "member" | "moderator" | "admin" | "builder">
```

So for example:

```bash
-role set "Smell of curry" "admin"
```

It's a very simple system and you can manage player's permissions with ease
to view permissions simply:

```bash
-role get <player: String>
```

## Commands:

See all commands in-game by running **-help** in chat, Please note the permissions
on each command before using it. You can set a users role via  `-role set <player: string> <role: "admin" | "moderator" | "member" | "builder">`

Also Please note that whenever it asks for a player name
that would require you to add spaces use quotes around your argument.

### Get a list of all commands

**Permissions needed**: `[]`

> **Note**: the help command will ONLY show you the command you CAN run at your current staff level

```bash
-help <page: number>
-help <command: string>
```

#### Examples:

```bash
-help
-help 2
-help ban
```

### Ping

**Permissions needed**: `[]`

Gets the current ping of the server

```bash
-ping <page: number>
```

### Version

**Permissions needed**: `[]`

Gets the current version of Rubedo

```bash
-version
```

### Bans a Player for a length:

**Permissions needed**: `["admin"]`

```bash
-ban <player: string> <length: int> <unit: string> [reason: string]
```

Unit can be  `years | yrs | weeks | days | hours | hrs | minutes | mins | seconds | secs | milliseconds | msecs | ms`

Or a date formatted like `smhdwy`

#### Example

```bash
-ban "Smell of curry" 20 mins "Hes too good"
```

### Unban a banned player

**Permissions needed**: `["admin"]`

```bash
-unban <player: string>
```

#### Example

```bash
-unban "Smell of curry"
```

### Freeze a player

**Permissions needed**: `["admin"]`

This stops the player from moving

```bash
-freeze <player: string> <reason: string>
```

#### Example

```bash
-freeze "Smell of curry" Hacking
```

### Unfreeze a frozen player

**Permissions needed**: `["admin"]`

This stops the player from moving

```bash
-unfreeze <player: string>
```

#### Example

```bash
-unfreeze "Smell of curry"
```

### Vanish

**Permissions needed**: `["admin"]`

This Changes you into a spectator mode where you are completely invisible, also can say messages in chat
making it seem like you left

![shows player left game](https://i.ibb.co/KrnnpFj/sdsdsd-Capture2sa.png)
![shows player joined game](https://i.ibb.co/9HGDW3L/Csdsdsdsdapture.png)

```bash
-vanish [say: boolean]
```

### Mute player

**Permissions needed**: `["admin", "moderator"]`

> **Note**: Unit works the same as the ban command

```bash
-mute <player: string> <length: int> <unit: string> [reason: string]
```

#### Example

```bash
-mute "Smell of curry" 5 hrs "Sending bad stuff in chat"
```

### Unmute player

**Permissions needed**: `["admin", "moderator"]`

```bash
-unmute <player: string>
```

#### Example

```bash
-unmute "Smell of curry"
```

### Clear a player's ender chest

**Permissions needed**: `["admin"]`

```bash
-ecwipe <player: string>
```

#### Example

```bash
-ecwipe "Smell of curry"
```

### Spawn an NPC

**Permissions needed**: `["admin"]`
> **Note**: This will spawn a npc at the command users current location

```bash
-npc
```

## Regions

Regions are a very important part of Rubedo because it protects
areas from being destroyed or people attacking or anything
that a protected region would need.

#### Add a new protection region

**Permissions needed**: `["admin"]`

```bash
-region add <from_x: int> <from_z: int> <to_x:int> <to_z: int> [name: string]
```

#### Example

```bash
-region add 20 90 300 900 "Spawn"
```

#### Remove a region

**Permissions needed**: `["admin"]`

> **Warning** This removes the region the player is CURRENTLY STANDING IN

```bash
-region remove
```

#### List all regions

**Permissions needed**: `["admin"]`

```bash
-region list
```

### Region Permissions

> **Note**: The config.js contains a configurable list of toggles for what
a default region can do

```js
/**
 * The default permissions for all regions made
 */
export const DEFAULT_REGION_PERMISSIONS = {
  /**
   * If players in this region can use doors, trapdoors, and switches like buttons and levers
   */
  doorsAndSwitches: true,
  /**
   * If players in this region can open containers, this is like chests, furnaces, hoppers, etc
   */
  openContainers: true,
  /**
   * If the players in this region can fight each other
   */
  pvp: false,
  /**
   * the entities allowed in this region
   */
  allowedEntitys: ["minecraft:player", "minecraft:npc", "minecraft:item"],
};
```

### Changing the region's permission

**Permissions needed**: `["admin"]`

> **Note**: Running this will automatically change the permission of the
CURRENT region the player is in

```bash
-region permission set <key: doorsAndSwitches | openContainers | pvp> <value: boolean>
```

#### Example

```
-region permission set pvp false
-region permission set openContainers false
-region permission set doorsAndSwitches true
```

#### Change mobs that can spawn in the region

**Permissions needed**: `["admin"]`

> **Note**: This will return the region permissions for the region the player is in

```bash
-region permission entities add <entity: string>
-region permission entities remove <entity: string>
```

#### Example

```bash
-region permission entities add "minecraft:cow"
-region permission entities remove "minecraft:cow"
```

### List the current permissions for this region

**Permissions needed**: `["admin"]`

**Note**: This will return the region permissions for the region the player is in

```bash
-region permission list
```

## Modules:

- **Anti CBE**: Prevents users from using CBE (Commandblock Exploits) which is done by checking the inventory every tick for these illegal items and clearing it.

- **Anti Crasher**: patches a crashing method (typically used by Horion) that teleports a user 30 million blocks far and kicks a user hopefully preventing the crash (USES: player.json)

- **Anti Illegal Enchants**: Checks every player's inventory to see if any item has enchants above the predefined limit set in [enchantment.ts](src/config/enchantments.ts) or via `-config enchantments set "enchantment" value`

- **Anti Fly**:  anti fly works by detecting horizontal velocity, when the user has FLYING_VELOCITY and is not under certain conditions they're considered as flying and, teleports them back to their position

- **Anti Gamemode**: Removes creative and clears the user inventory if the user is not an authorized user.
  > **Note**: **THIS IGNORES BUILDERS**

- **Anti NameSpoof**: Locates invalid Gamertags by comparing them against Xbox's Gamertag requirements and kicking the user out if they fail to meet them.

- **Anti Nuker**: works by logging the placement of blocks done by the player and detects if the next block break is done impossibly fast (50 milliseconds) then we cancel the breaking event.

- **ban bad Blocks/items**: checks if the player has illegal items or if they're placing a banned block and prevents the placement (while the ban list can be controlled via `-config`.

- **Anti Reach**: Detect players who are reaching and automatically cancel that action. This covers reach involving interacting, placing, breaking, and attacking. max reach is set to **7**.
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

## Configuration

Rubedo has made it so easy to edit all of its config files in-game. Most Anti cheats make it so
you have to know how to edit files and make packs, but with Rubedo you can do it all in-game
with commands

### Manage Protections

**Permissions needed**: `["admin"]`

protections is the name used for the man modules of Rubedo this includes stuff like anti-nuker and anti-reach...

value is the name of this protection you can view all of them in-game using -help

```
-config protections enable <value: string>
-config protections disable <value: string>
-config protections list
```

### Manage commands

**Permissions needed**: `["admin"]`

These commands will allow you to disable and enable certain commands

value is the command name you can view all of them in-game using -help

```
-config commands enable <value: string>
-config commands disable <value: string>
-config commands list
```

### Manage managers

**Permissions needed**: `["admin"]`

Managers are the main components of Rubedo they're used to moderate the server and manage bans, mutes, etc...

value is the manager's name you can view all of them in-game using -help

```
-config managers enable <value: string>
-config managers disable <value: string>
-config managers list
```

### Manage Banned items

**Permissions needed**: `["admin"]`

You can change what items are banned by adding or removing them with these commands

item is the item id of this item looks like "minecraft:item"

```
-config banned items add <item: string>
-config banned items remove <item: string>
```

### Manage Banned Blocks

**Permissions needed**: `["admin"]`

You can change what blocks are banned by adding or removing them with these commands

> **Note**: Block is the block id of this item looks like "minecraft:block"

```
-config banned blocks add <block: string>
-config banned blocks remove <block: string>
```

### Manage Max enchantment levels

**Permissions needed**: `["admin"]`

manage all the max enchantments that this server bans with this command

enchantment is the enchantmentType id you can view these in-game using -help

```
-config enchantments set <enchantment: string>
-config enchantments get <enchantment: string>
```

### Change server appeal link

**Permissions needed**: `["admin"]`

```
-config setAppealLink <link: string>
-config setAppealLink "https://discord.gg/a9MjfydsFz"
```

## Support

As Rubedo is Still in beta, there might be bugs that you could face. If you need support PLEASE Join the [Discord](https://discord.gg/a9MjfydsFz) and submit your problems there
