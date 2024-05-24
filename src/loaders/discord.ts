import { InteractionHandler } from "./../discord/handler/index";
import {
  Client,
  Events,
  GatewayIntentBits,
  REST as DiscordRestClient,
  Routes,
  ChatInputCommandInteraction,
} from "discord.js";
import config from "../config";

// export default loader로 내보내기 해야하니까 모듈화?라고해야하나..
export default class discordAppliaction {
  private client: Client; // 디스코드봇
  private discordRestClient: DiscordRestClient; // 디스코드한테 command 등록할때
  private interactionHandler: InteractionHandler;

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds],
    });
  }

  start() {
    this.client
      .login(config.DISCORD_BOT_TOKEN)
      .then(() => {
        this.addClientEventHandlers();
        this.registerSlashCommands();
      })
      .catch((err) => console.log("Error starting bot", err));
    this.discordRestClient = new DiscordRestClient().setToken(
      config.DISCORD_BOT_TOKEN,
    );
    this.interactionHandler = new InteractionHandler();
  }

  // 공식문서에 등록 예시가 2개가 있음. 꼼꼼히 보자.
  // link : https://discordjs.guide/creating-your-bot/command-deployment.html#guild-commands
  registerSlashCommands() {
    const commands = this.interactionHandler.getSlashCommands();
    this.discordRestClient
      // applicationGuildCommands에는 두가지 인수가 필요해서 ? 을 했지만 아래로 더 글을 내려보니
      // 글로벌로 하는게 있었음.
      .put(Routes.applicationCommands(config.DISCORD_APPLICATION_ID), {
        body: commands,
      })
      .then((data: any) => {
        console.log(
          `Successfully registered ${data.length} global application (/) commands`,
        );
      })
      .catch((err) => {
        console.error("Error registering application (/) commands", err);
      });
  }

  addClientEventHandlers() {
    this.client.on(Events.InteractionCreate, (interaction) => {
      this.interactionHandler.handleInteraction(
        interaction as ChatInputCommandInteraction,
      );
    });

    this.client.on(Events.ClientReady, () => {
      console.log("BDO bot client logged in");
    });

    this.client.on(Events.Error, (err: Error) => {
      console.error("Client error", err);
    });
  }
}
