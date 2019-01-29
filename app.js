var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');
var vencboleto = require('./vencboleto');
var buscaToken = require('./busca_token');
var autorizacaoBraspag = require('./autorizacaoBraspag');
var statusPedido = require('./statusPedido');
var lucratividade = require('./lucratividade');
var boasVindas = require('./enviarBoasVindas');
const moment = require('moment');
const env = require('./.env');
const TelegramBot = require('node-telegram-bot-api');
// replace the value below with the Telegram token you receive from @BotFather

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(env.token, { polling: true });
var PessoasAutorizadas = env.pessoasAutorizadas;

bot.onText(/\/pk/, (ctx,match) => {
    const chatId = ctx.chat.id;
    const texto = ctx.text;
    const nome = ctx.from.first_name;
    var autorizado = autorizacao(PessoasAutorizadas, chatId);
    var pk_token = texto.substring(4);

    if(pk_token === ''){
       bot.sendMessage(chatId, nome + ", digite o comando /pk + <code>cód da consultora</code>. \n Exemplo: /pk 12345567", { parse_mode: "HTML" })
    }else{
        if(!isNumber(pk_token)){
            bot.sendMessage(chatId, nome + ", o texto digitado: " + "<b>" + pk_token + "</b>" + ", não é um cód de CN valido!", { parse_mode: "HTML" });
        } else if (autorizado){
            buscaToken.pk(ctx, bot, pk_token);
        }else{
            autorizacaoNegada(ctx);
        }
    }
});

bot.onText(/\/lucra/, (ctx, match) => {
    const chatId = ctx.chat.id;
    const texto = ctx.text;
    const nome = ctx.from.first_name;
    var autorizado = autorizacao(PessoasAutorizadas, chatId);
    var lucraPedido = texto.substring(6);

    if(lucraPedido === ''){
        bot.sendMessage(chatId, nome + ", digite o comando /pk + <code>cód da consultora</code>. \n Exemplo: /pk 12345567", { parse_mode: "HTML" })
     }else{
         if(!isNumber(lucraPedido)){
             bot.sendMessage(chatId, nome + ", o texto digitado: " + "<b>" + lucraPedido + "</b>" + ", não é um cód de CN valido!", { parse_mode: "HTML" });
         } else if (autorizado){
             lucratividade.lucratividade_pedido(ctx, bot, lucraPedido);
         }else{
             autorizacaoNegada(ctx);
         }
     }

})

bot.onText(/\/status/, (ctx,match) => {
    const chatId = ctx.chat.id;
    const texto = ctx.text;
    const nome = ctx.from.first_name;
    var autorizado = autorizacao(PessoasAutorizadas, chatId);
    var pedido = texto.substring(8);

    if(pedido === ''){
        bot.sendMessage(chatId, nome + ", digite o comando /status + <code>numero do pedido</code>. \n Exemplo: /status 123456789", { parse_mode: "HTML" });
    }else {
        if(!isNumber(pedido)){
            bot.sendMessage(chatId, nome + ", o texto digitado: " + "<b>" + pedido + "</b>" + ", não é um número de pedido válido!", { parse_mode: "HTML" });
        }else if (autorizado){
            statusPedido.status_ped(ctx, bot, pedido);
        } else{
            autorizacaoNegada(ctx);
        }
    }
});

bot.onText(/\/cartao/, (ctx,match) => {
    const chatId = ctx.chat.id;
    const texto = ctx.text;
    const nome = ctx.from.first_name;
    var autorizado = autorizacao(PessoasAutorizadas, chatId);
    var nm_pedido = texto.substring(7);

    if(nm_pedido === ''){
        bot.sendMessage(chatId, nome + ", digite o comando /cartao + <code>numero do pedido</code>. \n Exemplo: /cartao 123456789", { parse_mode: "HTML" });
    }else {
        if (!isNumber(nm_pedido)){
            bot.sendMessage(chatId, nome + ", o texto digitado: " + "<b>" + nm_pedido + "</b>" + ", não é um número de pedido válido!", { parse_mode: "HTML" }); 
        }else if(autorizado){
            autorizacaoBraspag.braspag(ctx,bot,nm_pedido);
            } else{
                autorizacaoNegada(ctx);
            }
    }
});

bot.onText(/\/boleto/, (ctx, match) => {
    const chatId = ctx.chat.id;
    const texto = ctx.text;
    const nome = ctx.from.first_name;
    var autorizado = autorizacao(PessoasAutorizadas, chatId);
    var num_pedido = texto.substring(7);

    if(num_pedido === ''){
        bot.sendMessage(chatId, nome + ", digite o comando /boleto + <code>numero do pedido</code>. \n Exemplo: /boleto 123456789" , { parse_mode: "HTML" });
    }else {

    if (!isNumber(num_pedido)){
        bot.sendMessage(chatId, nome + ", o texto digitado: " + "<b>" + num_pedido + "</b>" + ", não é um número de pedido válido!", { parse_mode: "HTML" });
        
    }/*else {
        vencboleto.venc_boleto(ctx, bot, num_pedido);
    }*/
    else if(autorizado){
        vencboleto.venc_boleto(ctx, bot, num_pedido);
        } else{
            autorizacaoNegada(ctx);
        }
    }
});

bot.on('text', (ctx) => {

    console.log('ctx', ctx);

    a = ctx.text.split(" ");
     const comando = a[0];

    if (comando == '/start'){
        boasVindas.enviarBoasVindas(ctx);
    }else if (comando == '/boleto'){
        
    }else if(comando == '/cartao'){

    }else if (comando == '/pk'){

    }else if (comando == '/status'){

    }else if(comando == '/lucra'){

    }else{
         enviarComandos(ctx);
    }

});


// functions:
function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    } 

function autorizacao(PessoasAutorizadas, chatId){
    var autorizado = false
    for (i=0; i<PessoasAutorizadas.length;i++){
        if (chatId == PessoasAutorizadas[i]){
            autorizado = true;
        }
    }
    return autorizado;
}    

function autorizacaoNegada(ctx){
    const chatId = ctx.chat.id;
    const nome = ctx.from.first_name;
    bot.sendMessage(chatId, nome + ", eu não sou autorizado a te responder." 
    + "\n Qualquer dúvida, acionar o Rhenan da SysMap");
}

function enviarComandos(ctx){
    const chatId = ctx.chat.id;
    const nome = ctx.from.first_name;
    bot.sendMessage(chatId, 'ChatId: ' + '<code>' + chatId + '</code>' + '\n\n' + nome + ', os comandos disponiveis são:'
        + '\n\n-> ' + "/boleto <code>numero do pedido</code>"  + '\n Exemplo: /boleto <code>123456789</code>'
        + '\n\n' + '-> ' + "/pk <code>código da consultora</code>" + '\n Exemplo: /pk <code>123456789</code>'
        + '\n\n' + '-> ' + "/cartao <code>numero do pedido</code>" + '\n Exemplo: /cartao <code>123456789</code>'
        + '\n\n' + '-> ' + "/status <code>numero do pedido</code>" + '\n Exemplo: /status <code>123456789</code>'
        + '\n\n' + '-> ' + "/lucra <code>numero do pedido</code>" + '\n Exemplo: /lucra <code>123456789</code>', {parse_mode: "HTML"});
}

// Note: connections should always be released when not needed
function doRelease(connection) {
    connection.close(
        function (err) {
            if (err) {
                console.error(err.message);
            }
        });
}

function doClose(connection, resultSet) {
    resultSet.close(
        function (err) {
            if (err) { console.error(err.message); }
            doRelease(connection);
        });
}