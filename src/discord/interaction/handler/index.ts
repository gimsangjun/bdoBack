import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../commands";
import LoginCommand from "../commands/auth/login";
import LogoutCommand from "../commands/auth/logout";
import updateCommand from "../commands/item/update";

export class InteractionHandler {
  private commands: Command[];

  constructor() {
    this.commands = [
      new LoginCommand(),
      new LogoutCommand(),
      new updateCommand(),
    ];
  }

  getSlashCommands() {
    return this.commands.map((command: Command) =>
      command.slashCommandConfig.toJSON(),
    );
  }

  async handleInteraction(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    const commandName = interaction.commandName;

    const matchedCommand = this.commands.find(
      (command) => command.name === commandName,
    );

    if (!matchedCommand) {
      console.error("Command not matched");
      return;
    }

    try {
      await matchedCommand.execute(interaction);
      console.log(
        `Successfully executed command [/${interaction.commandName}]`,
        {
          guild: {
            id: interaction.guildId,
            name: interaction.guild?.name,
          },
          user: { name: interaction.user.globalName },
        },
      );
    } catch (err) {
      console.error(
        `Error executing command [/${interaction.commandName}]: ${err}`,
        {
          guild: {
            id: interaction.guildId,
            name: interaction.guild?.name,
          },
          user: { name: interaction.user.globalName },
        },
      );
    }
  }
}
