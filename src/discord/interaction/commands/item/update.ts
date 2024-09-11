// import {
//   CacheType,
//   ChatInputCommandInteraction,
//   SlashCommandBuilder,
// } from "discord.js";
// import { Command } from "..";
// import DiscordBotService from "../../../../services/discordBotService";

// export default class updateCommand implements Command {
//   name = "update";
//   description = "가격알림 설정한 아이템들의 가격을 전부 업데이트, 알림.";
//   slashCommandConfig = new SlashCommandBuilder()
//     .setName(this.name)
//     .setDescription(this.description);
//   async execute(interaction: ChatInputCommandInteraction<CacheType>) {
//     const message = await DiscordBotService.update(interaction);
//     return interaction.reply(message);
//   }
// }
