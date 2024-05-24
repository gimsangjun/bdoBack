import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../commands";
import { PingCommand } from "../commands/ping";

export class InteractionHandler {
  private commands: Command[];

  constructor() {
    this.commands = [new PingCommand()];
  }

  getSlashCommands() {
    return this.commands.map((command: Command) =>
      command.slashCommandConfig.toJSON(),
    );
  }

  // async은 암묵적으로 리턴값이 Promise임.
  async handleInteraction(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    const commandName = interaction.commandName;

    const matchedCommand = this.commands.find(
      (command) => command.name === commandName,
    );

    // 이런식으로 Promise를 reject를 할수 있다.
    if (!matchedCommand) {
      //new rejected promise를 생성.
      return Promise.reject("Command not matched");
    }

    // Promise처리 이렇게
    matchedCommand
      .execute(interaction)
      .then(() => {
        console.log(
          `Sucesfully executed command [/${interaction.commandName}]`,
          {
            guild: {
              id: interaction.guildId,
              name: interaction.guild.name,
            },
            user: { name: interaction.user.globalName },
          },
        );
      })
      .catch((err) =>
        console.log(
          `Error executing command [/${interaction.commandName}]: ${err}`,
          {
            guild: {
              id: interaction.guildId,
              name: interaction.guild.name,
            },
            user: { name: interaction.user.globalName },
          },
        ),
      );
  }
}
