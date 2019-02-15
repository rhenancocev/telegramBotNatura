const env = require('../tokenAcesso/.env');
const TelegramBot = require('node-telegram-bot-api');
// replace the value below with the Telegram token you receive from @BotFather

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(env.token, { polling: false });

var pessoasAutorizadas = [793933676,726171735,621550962,461469521,670468351,778923612,747336031,652673739,480623991,751654122,717829587];
var PessoasAutorizadasExecutarPedido = [793933676,726171735,621550962,480623991,670468351,751654122,717829587];

module.exports = {
    pessoasAutorizadas,
    PessoasAutorizadasExecutarPedido

}