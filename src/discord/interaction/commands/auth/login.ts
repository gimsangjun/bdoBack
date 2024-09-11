// import {
//   CacheType,
//   ChatInputCommandInteraction,
//   SlashCommandBuilder,
// } from "discord.js";
// import { Command } from "..";
// import DiscordBotService from "../../../../services/discordBotService";

// export default class LoginCommand implements Command {
//   name = "login";
//   description = "자동알림을 하기위한 채널 Id등록";
//   slashCommandConfig = new SlashCommandBuilder()
//     .setName(this.name)
//     .setDescription(this.description);

//   async execute(
//     interaction: ChatInputCommandInteraction<CacheType>,
//   ): Promise<any> {
//     DiscordBotService.login(interaction);
//     return interaction.reply("Login Success");
//   }
// }
