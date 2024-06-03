import { Command } from "..";
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import DiscordBotService from "../../../../services/discordBotService";

export default class LogoutCommand implements Command {
  name = "logout";
  description = "Logout 테스트";
  slashCommandConfig = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  async execute(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<any> {
    DiscordBotService.logout(interaction);
    return interaction.reply("Logout Success");
  }
}
