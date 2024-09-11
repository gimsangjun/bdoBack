// import { InteractionHandler } from "../discord/interaction/handler/index";
// import {
//   Client,
//   Events,
//   GatewayIntentBits,
//   REST as DiscordRestClient,
//   Routes,
//   ChatInputCommandInteraction,
// } from "discord.js";
// import config from "../config";

// // export default loader로 내보내기 해야하니까 모듈화?라고해야하나..
// export default class discordAppliaction {
//   private client: Client; // Discord.js 라이브러리의 핵심 클래스이며, 디스코드 봇과 디스코드 API 사이의 상호작용을 관리
//   private discordRestClient: DiscordRestClient; // 디스코드의 REST API와 상호작용하기 위해 사용
//   private interactionHandler: InteractionHandler;

//   constructor() {
//     // intent : 의지, 어떤 이벤트에 반응할지 명확하게 지정하는 설정
//     // 맨처음 디스코드봇을 초대할 때, permission을 설정하는데, 허가되지 않은 intent를 요구하면 오류남.
//     this.client = new Client({
//       intents: [
//         GatewayIntentBits.Guilds,
//         GatewayIntentBits.GuildMessages,
//         GatewayIntentBits.MessageContent,
//         GatewayIntentBits.DirectMessages,
//       ],
//     });
//     this.discordRestClient = new DiscordRestClient();
//     this.interactionHandler = new InteractionHandler();
//   }
//   async start() {
//     try {
//       // client는 discord bot인듯
//       await this.client.login(config.DISCORD_BOT_TOKEN);
//       this.discordRestClient.setToken(config.DISCORD_BOT_TOKEN);
//       this.addClientEventHandlers();
//       await this.registerSlashCommands();

//       // this.startMonitoring();
//       // this.sendPriceAlert("엘쉬 장검", 80000, "742294333348118562");
//     } catch (err) {
//       console.log("Error starting bot", err);
//     }
//   }

//   // 공식문서에 등록 예시가 2개가 있음. 꼼꼼히 보자.
//   // link : https://discordjs.guide/creating-your-bot/command-deployment.html#guild-commands
//   async registerSlashCommands() {
//     const commands = this.interactionHandler.getSlashCommands();
//     try {
//       const data: any = await this.discordRestClient.put(
//         Routes.applicationCommands(config.DISCORD_APPLICATION_ID),
//         {
//           body: commands,
//         },
//       );
//       console.log(
//         `Successfully registered ${data.length} global application (/) commands:`,
//         data.map((cmd: any) => cmd.name).join(", "),
//       );
//     } catch (err) {
//       console.error("Error registering application (/) commands", err);
//     }
//   }

//   addClientEventHandlers() {
//     // interaction - 상호작용, Interactions는 봇이 유저와 상호작용하는 방식
//     // slash command 등이 있음
//     this.client.on(Events.InteractionCreate, (interaction) => {
//       this.interactionHandler.handleInteraction(
//         interaction as ChatInputCommandInteraction,
//       );
//     });

//     this.client.on(Events.ClientReady, () => {
//       console.log("BDO bot client logged in");
//     });

//     this.client.on(Events.Error, (err: Error) => {
//       console.error("Client error", err);
//     });

//     // 테스트 용도
//     // 특정 채널에 message 보내기
//     // this.client.on(Events.MessageCreate, async (message: Message) => {
//     //   // console.log("Message received:", message);
//     //   // 특정 채널에서 메시지를 작성했는지 확인
//     //   console.log("channels", this.client.channels);
//     //   const channel = this.client.channels.cache.get(message.channelId);
//     //   // console.log("Channel:", channel);
//     // });
//   }

//   // TODO: 하루종일 모니터링 하는건 나중에, 일단 slashcommand를 통해 알림을 받을수 있도록하기
// }
