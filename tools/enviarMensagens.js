const env = require('../tokenAcesso/.env');
const TelegramBot = require('node-telegram-bot-api');
// replace the value below with the Telegram token you receive from @BotFather

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(env.token, { polling: false });

module.exports = {
    enviarBoasVindas: function(ctx){
    const chatId = ctx.chat.id;
    const nome = ctx.from.first_name + ' ' + ctx.from.last_name;

    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'ChatId: ' + '<code>' + chatId + '</code>' +'\n\n' + 'Olá ' + nome + ', seja Bem-Vindo. Segue os comandos disponíveis:'
        + '\n\n' + 'Se deseja saber a data de cancelamento de um pedido boleto à vista, utilize o comando:'
        + '\n' + '-> ' + "/boleto <code>numero do pedido</code>" + '\n Exemplo: /boleto <code>123456789</code>'
        + '\n\n' + 'Se deseja saber a PK da consultora referente a PagSeguro, utilize o comando:'
        + '\n' + '-> ' + "/pk <code>código da consultora</code>" + '\n Exemplo: /pk <code>123456789</code>'
        + '\n\n' + 'Se deseja saber o motivo do cancelamento de um pedido feito pelo cartão de crédito, utilize o comando:'
        + '\n' + '-> ' + "/cartao <code>numero do pedido</code>" + '\n Exemplo: /cartao <code>123456789</code>'
        + '\n\n' + 'Se deseja saber o status de um pedido, utilize o comando:'
        + '\n' + '-> ' + "/status <code>numero do pedido</code>" + '\n Exemplo: /status <code>123456789</code>'
        + '\n\n' + 'Se deseja saber a % de lucratividade de um pedido finalizado, utilize o comando:'
        + '\n' + '-> ' + "/lucra <code>numero do pedido</code>" + '\n Exemplo: /lucra <code>123456789</code>'
        + '\n\n' + 'Se deseja saber a pontuação disponivel para CN captar um pedido, utilize o comando:'
        + '\n' + '-> ' + "/pts <code>código da consultora</code>" + '\n Exemplo: /pts <code>123456789</code>'
        + '\n\n\n' + "Comandos para extração de gráficos: "
        + '\n\n' + '-> ' + '/pedidos_dia - Pedidos finalizados por dia'
        + '\n\n' + '-> ' + '/pedidos_minuto - Pedidos finalizados por minuto'
        + '\n\n' + '-> ' + '/pedidos_hora - Pedidos finalizados por hora', {parse_mode: "HTML"});

    },
        enviarComandos: function(ctx){
        const chatId = ctx.chat.id;
        const nome = ctx.from.first_name;
        bot.sendMessage(chatId, 'ChatId: ' + '<code>' + chatId + '</code>' + '\n\n' + nome + ', os comandos disponiveis são:'
            + '\n\n-> ' + "/boleto <code>numero do pedido</code>"  + '\n Exemplo: /boleto <code>123456789</code>'
            + '\n\n' + '-> ' + "/pk <code>código da consultora</code>" + '\n Exemplo: /pk <code>123456789</code>'
            + '\n\n' + '-> ' + "/cartao <code>numero do pedido</code>" + '\n Exemplo: /cartao <code>123456789</code>'
            + '\n\n' + '-> ' + "/status <code>numero do pedido</code>" + '\n Exemplo: /status <code>123456789</code>'
            + '\n\n' + '-> ' + "/lucra <code>numero do pedido</code>" + '\n Exemplo: /lucra <code>123456789</code>'
            + '\n\n' + '-> ' + "/pts <code>código da consultora</code>" + '\n Exemplo: /pts <code>123456789</code>'
            + '\n\n\n' + "Comandos para extração de gráficos: "
            + '\n\n' + '-> ' + '/pedidos_dia - Pedidos finalizados por dia'        
            + '\n\n' + '-> ' + '/pedidos_minuto - Pedidos finalizados por minuto'
            + '\n\n' + '-> ' + '/pedidos_hora - Pedidos finalizados por hora', {parse_mode: "HTML"});
        },

        enviarRespostaCasoVazia: function(ctx, x, y){
        const chatId = ctx.chat.id;
        const nome = ctx.from.first_name;
        bot.sendMessage(chatId, nome + ", digite o comando " + x + " <code>" + y + "</code>." 
                                     + "\n Exemplo: " + x + " 123456789", { parse_mode: "HTML" })
        },

        enviarRespostaIfNotNumber: function(ctx, x, y){
        const chatId = ctx.chat.id;
        const nome = ctx.from.first_name;  
        bot.sendMessage(chatId, nome + ", o texto digitado: " + "<b>" + x + "</b>" 
                                     + ", não é um " + y + " válido!", { parse_mode: "HTML" } )

        },
        enviarMensagemDeEspera: function(ctx){
            const chatId = ctx.chat.id;
            const nome = ctx.from.first_name
            bot.sendMessage(chatId, 'Aguarde ' + nome + ', estamos gerando seu gráfico...');
        }

}