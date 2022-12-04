## Meant to be used on first load, this enables the first user with the "Owner" role and then this function wont work anymore.
tellraw @s {"rawtext":[{"text":"§l§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§r"}]}
tellraw @s {"rawtext":[{"text":"§l§fWelcome to Rubedo!§r"}]}
tellraw @s {"rawtext":[{"text":"§f§lThe Most Advanced Anti-cheat for your realms/worlds/servers"}]}
tellraw @s {"rawtext":[{"text":"§b§lFor Updates Checkout Smell of curry on YouTube§r"}]}
tellraw @s {"rawtext":[{"text":"§r"}]}
tellraw @s {"rawtext":[{"text":"§fThis Mod can be downloaded at discord.gg/a9MjfydsFz"}]}
tellraw @s {"rawtext":[{"text":"§b§oTip: For Documentation Check github.com/smell-of-curry/rubedo"}]}
tellraw @s {"rawtext":[{"text":"§l§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§9-§f-§r"}]}

effect @s darkness 3 255 true
tag @s add CHECK
event entity @s "rubedo:becomeAdmin"
tellraw @s[tag=CHECK] {"rawtext":[{"text":"§cCannot give admin: Put Rubedo above another behaivor packs"}]}