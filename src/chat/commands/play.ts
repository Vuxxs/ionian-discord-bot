import { Player, QueryType } from "discord-player";
import { CommandParameters } from "src/modules/commands";
import { isVerified, musicFallback } from "src/modules/common";

async function play({ msg, client, args }: CommandParameters) {
  if (!client.musicCommands) musicFallback(msg);

  if (isVerified(msg.guild!.id)) musicFallback(msg);

  if (!client.player) return;

  const searchIndex = args.toString().replace(/,/g, " ");

  const searchResult = await client.player
    .search(searchIndex, {
      requestedBy: msg.author,
      searchEngine: QueryType.AUTO,
    })
    .catch(() => {});

  if (!searchResult || !searchResult.tracks.length) {
    msg.channel.send(`No results for \`\`${searchIndex}\`\``);
    return;
  }

  const queue = await client.player.createQueue(msg.guild!, {
    metadata: msg.channel,
  });

  try {
    if (!queue.connection) await queue.connect(msg.member!.voice.channel!);
  } catch {
    void client.player.deleteQueue(msg.guildId!);
    msg.channel.send("Could not join your voice channel.");
    return;
  }

  searchResult.playlist
    ? queue.addTracks(searchResult.tracks)
    : queue.addTrack(searchResult.tracks[0]);
  if (!queue.playing) await queue.play();
}

play.desc = "Play a song from YouTube in your current voice channel";
play.category = "music";
export default play;
