import { Client, Guild, SlashCommandBuilder } from "discord.js";
import { isUni } from "./common";

const { REST } = require("@discordjs/rest");
import { Routes } from "discord-api-types/v10";
import { interactions } from "./interactions";

export default async function registerSlashCommands(client: Client) {
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  console.log("Trying to refresh application (/) commands...");
  try {
    const guilds = client.guilds.cache.map((guild: Guild) =>
      client.guilds.cache.get(guild.id)
    );

    const interactionKeys = Object.keys(interactions);

    const slashCommands: SlashCommandBuilder[] = [];
    const slashCommandsUni: SlashCommandBuilder[] = [];
    interactionKeys.forEach(async (key) => {
      const interaction = interactions[key];
      const slashCommand = new SlashCommandBuilder().setName(key);
      if (!interaction.desc) return; // Will throw an error without a description
      slashCommand.setDescription(interaction.desc);
      if (interaction.ops) {
        interaction.ops.forEach((option) => {
          slashCommand.addStringOption(option);
        });
      }

      if (!interaction.uni) {
        let duplicate = false;
        for (const slashCommand of slashCommands) {
          if (slashCommand.description === interaction.desc) {
            duplicate = true;
            break;
          }
        }
        if (!duplicate) slashCommands.push(slashCommand);
      }

      if (interaction.uni) {
        slashCommandsUni.push(slashCommand);
      }
    });

    if (client.user)
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: slashCommands,
      });

    guilds.forEach(async (guild) => {
      if (!guild || !client.user) return;
      if (!isUni(guild.id)) return;
      if (!guild.members.me)
        await rest.put(
          Routes.applicationGuildCommands(client.user.id, guild.id),
          {
            body: slashCommandsUni,
          }
        );
    });

    console.log("Finished refreshing application (/) commands.");
  } catch (err) {
    console.log(`ERROR! Failed to refresh application (/) commands:\n ${err}`);
  }
}
