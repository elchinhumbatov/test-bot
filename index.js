import TelegramBot from 'node-telegram-bot-api';
import { Configuration, OpenAIApi } from "openai";
import { Bot } from "grammy";
import { webhookCallback } from "grammy";
import express from "express";
import * as dotenv from 'dotenv';
dotenv.config()


const token = process.env.BOT_TOKEN;

const gptApiKey = process.env.OPENAI_API_KEY;
const configuration = new Configuration({ apiKey: gptApiKey });
const openai = new OpenAIApi(configuration);

const bot = new Bot(process.env.BOT_TOKEN || "");

bot.api.setMyCommands([
  {command: '/start', description: 'Initial command to start'},
  {command: '/info', description: 'Get Information'},
  {command: '/chat', description: 'Hey, I\'m T-AI, and still learning'},
])

const replyWithIntro = async ctx => {
  // console.log(ctx);
  const text = ctx.msg.text;
  const chatId = ctx.me.id;
  switch (text) {
    case '/start':
      ctx.reply('Welcome on board, ' + ctx.from.first_name)
      break;

    case '/info':
      await ctx.reply('This is just a test info message');
      break;

    default:
      bot.api.sendChatAction(chatId, 'typing');
      let response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        temperature: 0,
        max_tokens: 200,
      });
      // console.log(response.data.choices)
      ctx.reply(response.data.choices[0].text);
      break;
  }

  // ctx.reply(introductionMessage, {
  //   parse_mode: "HTML",
  // });
}

bot.on("message", replyWithIntro);

if (process.env.NODE_ENV === "production") {
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  bot.start();
}


// const bot = new TelegramBot(token, { polling: true });

// bot.setMyCommands([
//   {command: '/start', description: 'Initial command to start'},
//   {command: '/info', description: 'Get Information'}
// ])

// bot.on('message', async (msg) => {
//   const text = msg.text;
//   const chatId = msg.chat.id;
//   // console.log(msg)
//   switch (text) {
//     case '/start':
//       await bot.sendMessage(chatId, 'Welcome on board, ' + msg.from.first_name);
//       await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/88d/414/88d414f4-e3ce-489f-a908-7bd9d0b9978c/256/2.webp');
//       break;

//     case '/info':
//       await bot.sendMessage(chatId, 'This is just a test info message');
//       break;
  
//     default:
//       await bot.sendChatAction(chatId, 'typing');
      
//       let response = await openai.createCompletion({
//         model: "text-davinci-003",
//         prompt: msg.text,
//         temperature: 0,
//         max_tokens: 200,
//       });
//       console.log(response.data.choices)
//       await bot.sendMessage(chatId, response.data.choices[0].text);
//       break;
//   }
// });

