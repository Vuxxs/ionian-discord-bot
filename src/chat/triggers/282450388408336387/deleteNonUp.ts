import { Message } from "discord.js";

export default function deleteNonUp(msg: Message) {
  if (msg.guild?.id !== "282450388408336387") return;

  if (msg.channel.id !== "785976881027219497") return;

  if (msg.content !== "^") msg.delete();
}