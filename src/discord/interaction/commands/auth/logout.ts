// import { Command } from "..";
// import {
//   CacheType,
//   ChatInputCommandInteraction,
//   SlashCommandBuilder,
// } from "discord.js";
// import DiscordBotService from "../../../../services/discordBotService";

// export default class LogoutCommand implements Command {
//   name = "logout";
//   description = "자동알림 해제를 위한 채널ID등록 삭제";
//   slashCommandConfig = new SlashCommandBuilder()
//     .setName(this.name)
//     .setDescription(this.description);

//   async execute(
//     interaction: ChatInputCommandInteraction<CacheType>,
//   ): Promise<any> {
//     DiscordBotService.logout(interaction);
//     return interaction.reply("Logout Success");
//   }
// }
