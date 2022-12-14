import { CommandParameters } from "src/modules/commands";

function ping({ msg, client }: CommandParameters) {
  msg.channel.send(`..pong! (${client.ws.ping}ms)`);
}

ping.desc = "Check bot's ping";
export default ping;
