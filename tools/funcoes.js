const env = require('../tokenAcesso/.env');
const TelegramBot = require('node-telegram-bot-api');
// replace the value below with the Telegram token you receive from @BotFather

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(env.token, { polling: false });

module.exports = {
    isNumber: function (n){
        return !isNaN(parseFloat(n)) && isFinite(n);
    },

    autorizacao: function (PessoasAutorizadas, chatId){
        var autorizado = false
        for (i=0; i<PessoasAutorizadas.length;i++){
            if (chatId == PessoasAutorizadas[i]){
                autorizado = true;
            }
        }
        return autorizado;
    },

    autorizacaoNegada: function (ctx){
        const chatId = ctx.chat.id;
        const nome = ctx.from.first_name;
        bot.sendMessage(chatId, nome + ", eu não sou autorizado a te responder." 
        + "\nQualquer dúvida, acionar o <b>Rhenan Cocev</b> da SysMap", { parse_mode: "HTML" });
    }

}