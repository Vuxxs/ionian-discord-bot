import { ChannelType, Client, EmbedBuilder, Message } from "discord.js";
import { isDev } from "../../../tools/common";

function announce(msg: Message, args: string[], extras: { client: Client }) {
  if (!isDev(msg.author.id)) return;

  const announcement = () => args.join(" ");
  const announcement_options = [];

  // Check for options and remove them from the final message.
  while (true) {
    if (args[args.length - 1].startsWith("--")) {
      announcement_options.push(args.pop()?.substring(2).toLowerCase());
    } else {
      break;
    }
  }

  // Create the announcement Embed
  const embed = new EmbedBuilder()
    .setTitle(announcement())
    .setColor("#FF69B4")
    .setAuthor({
      name: msg.author.tag,
      iconURL: msg.author.displayAvatarURL(),
    });

  const guilds = extras.client.guilds.cache.map((guild) =>
    extras.client.guilds.cache.get(guild.id)
  );

  // Send the announcement in the first available channel of each guild
  announcements: for (const guild of guilds) {
    if (guild) {
      const channels = guild.channels.cache.map((channel) =>
        extras.client.channels.cache.get(channel.id)
      );

      for (const channel of channels) {
        if (
          channel &&
          channel.type === ChannelType.GuildText &&
          guild.members.me &&
          guild.members.me.permissionsIn(channel).has("SendMessages")
        ) {
          // Check and apply announcement options
          if (announcement_options.includes("plain")) {
            channel.send(announcement());
          } else if (
            announcement_options.includes("image") ||
            announcement_options.includes("img") ||
            announcement_options.includes("picture") ||
            announcement_options.includes("pic")
          ) {
            if (
              announcement().startsWith("http:") ||
              announcement().startsWith("https:")
            ) {
              embed.setTitle(null).setImage(announcement().toString());
              channel.send({ embeds: [embed] });
            } else {
              msg.channel.send("Invalid Image URL");
              break announcements;
            }
          } else if (announcement_options.includes("test")) {
            msg.channel.send({ embeds: [embed] });
            break announcements;
          } else {
            channel.send({ embeds: [embed] });
          }
          break;
        }
      }
    }
  }
}

announce.dev = true;
export default announce;
