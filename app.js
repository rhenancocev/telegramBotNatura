var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');
var vencboleto = require('./vencboleto');
var buscaToken = require('./busca_token');
var autorizacaoBraspag = require('./autorizacaoBraspag');
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
        bot.sendMessage(chatId, nome + ", digite o comando /pk + cód da consultora. \n Exemplo: /pk 12345567")
    }else{
        if(!isNumber(pk_token)){
            bot.sendMessage(chatId, nome + ", o texto digitado: " + pk_token + ", não é um cód de CN valido!");
        } else if (autorizado){
            buscaToken.pk(ctx, bot, pk_token);
        }else{
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
        bot.sendMessage(chatId, nome + ", digite o comando /cartao + o numero do pedido. \n Exemplo: /cartao 123456789");
    }else {
        if (!isNumber(nm_pedido)){
            bot.sendMessage(chatId, nome + ", o texto digitado: " + nm_pedido + ", não é um número de pedido válido!");
            
        }else if(autorizado){
            autorizacaoBraspag.braspag(ctx,bot,nm_pedido);
            } else{
                autorizacaoNegada(ctx);
            }
    }
})

bot.onText(/\/boleto/, (ctx, match) => {
    const chatId = ctx.chat.id;
    const texto = ctx.text;
    const nome = ctx.from.first_name;
    var autorizado = autorizacao(PessoasAutorizadas, chatId);
    var num_pedido = texto.substring(7);

    if(num_pedido === ''){
        bot.sendMessage(chatId, nome + ", digite o comando /boleto + o numero do pedido. \n Exemplo: /boleto 123456789" );
    }else {

    if (!isNumber(num_pedido)){
        bot.sendMessage(chatId, nome + ", o texto digitado: " + num_pedido + ", não é um número de pedido válido!");
        
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

    if (comando == '/start') {
        enviaBoasVindas(ctx);
    } else if (comando == '/boleto') {
        
    }else if(comando == '/cartao'){

    }else if (comando == '/pk'){

    }else {
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

function enviaBoasVindas(ctx) {
    const chatId = ctx.chat.id;
    const nome = ctx.from.first_name + ' ' + ctx.from.last_name;
    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'ChatId: '+ chatId +'\n\n' + 'Olá ' + nome + ', seja Bem-Vindo. Segue os comandos disponíveis:'
        + '\n\n' + 'Se deseja saber a data de cancelamento de um pedido boleto à vista, utilize o comando:'
        + '\n' + '-> ' + "/boleto [numero do pedido]" + '\n Exemplo: /boleto 123456789'
        + '\n\n' + 'Se deseja saber a PK da consultora referente a PagSeguro, utilize o comando:'
        + '\n' + '-> ' + "/pk [código da consultora]" + '\n Exemplo: /pk 123456789'
        + '\n\n' + 'Se deseja saber o motivo do cancelamento de um pedido feito pelo cartão de crédito, utilize o comando:'
        + '\n' + '-> ' + "/cartao [numero do pedido]" + '\n Exemplo: /cartao 123456789');
}

function autorizacaoNegada(ctx){
    const chatId = ctx.chat.id;
    const nome = ctx.from.first_name;
    bot.sendMessage(chatId, nome + ", eu não sou autorizado a te responder." 
    + "\nQualquer dúvida, acionar o Rhenan da SysMap");
}

function enviarComandos(ctx){
    const chatId = ctx.chat.id;
    const nome = ctx.from.first_name;
    bot.sendMessage(chatId, 'ChatId: ' + chatId + '\n\n' + nome + ', os comandos disponiveis são:'
        + '\n\n-> ' + "/boleto [numero do pedido]"  + '\n Exemplo: /boleto 123456789'
        + '\n\n' + '-> ' + "/pk [código da consultora]" + '\n Exemplo: /pk 123456789'
        + '\n\n' + '->' + "/cartao [numero do pedido]" + '\n Exemplo: /cartao 123456789');
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