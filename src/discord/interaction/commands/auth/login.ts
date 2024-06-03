import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "..";
import DiscordBotService from "../../../../services/discordBotService";

export default class LoginCommand implements Command {
  name = "login";
  description = "Login 테스트";
  slashCommandConfig = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  async execute(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<any> {
    DiscordBotService.login(interaction);
    return interaction.reply("Login Success");
  }
}
