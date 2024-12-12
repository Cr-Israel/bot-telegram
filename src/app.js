require('dotenv').config();
const telegramBot = require('node-telegram-bot-api');

const fs = require('fs');
const { exec } = require('child_process');

const token = process.env.TOKEN
const bot = new telegramBot(token, { polling: true })

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id

  bot.sendMessage(chatId,
    `Bem-vindo ao Bot de Download do YouTube! 
    Envie uma URL do YouTube para baixar o vídeo ou áudio.`
  )
})

bot.on('message', (msg) => {
  const chatId = msg.chat.id
  const url = msg.text

  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    return bot.sendMessage(chatId, 'Por favor, envie uma URL do YouTube válida')
  }

  bot.sendMessage(chatId, 'Você quer baixar vídeo ou áudio? Digite "video" ou "audio"')

  bot.once('message', (response) => {
    const choice = response.text.toLowerCase()
    const output = choice === 'video' ? 'video.mp4' : 'audio.mp3'
    const command = choice === 'video' ? `yt-dlp -f best -o ${output} ${url}` : `yt-dlp -x --audio-format mp3 -o ${output} ${url}`

    bot.sendMessage(chatId, "Baixando... Isso pode levar alguns minutos.");

    exec(command, (error, stdout, stderr) => {
      if (error) {
        bot.sendMessage(chatId, `Erro ao baixar o arquivo. Tente novamente`)
        console.error(error)
        return;
      }

      bot.sendMessage(chatId, 'Download concluído com sucesso!')
      bot.sendDocument(chatId, output).then(() => {
        fs.unlinkSync(output)
      })
    })
  })
})