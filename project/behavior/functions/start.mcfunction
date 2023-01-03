## Meant to be used on first load, this enables the first user with the "Owner" role and then this function wont work anymore.
tag @s add CHECK_PACK
event entity @s "rubedo:becomeAdmin"
tellraw @s[tag=CHECK_PACK] {"rawtext":[{"text":"§cCannot give admin: Put Rubedo above another behaivor packs"}]}