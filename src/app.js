var vencboleto = require('./vencboleto');
var buscaToken = require('./busca_token');
var autorizacaoBraspag = require('./autorizacaoBraspag');
var statusPedido = require('./statusPedido');
var lucratividade = require('./lucratividade');
var pontuacao = require('./pontuacao');
var pedidosdia = require('./pedidosdia.js');
var pedidoshora = require('./pedidoshora.js');
var pedidosminuto = require('./pedidosminuto.js');
var enviarMensagens = require('../tools/enviarMensagens');
var funcoes = require('../tools/funcoes');
const env = require('../tokenAcesso/.env');
const TelegramBot = require('node-telegram-bot-api');
// replace the value below with the Telegram token you receive from @BotFather

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(env.token, { polling: true });
var PessoasAutorizadas = env.pessoasAutorizadas;
var PessoasAutorizadasExecutarPedido = env.PessoasAutorizadasExecutarPedido;

bot.onText(/\/pk/, (ctx,match) => {
    const chatId = ctx.chat.id;
    const texto = ctx.text;
    var autorizado = funcoes.autorizacao(PessoasAutorizadas, chatId);
    var pk_token = texto.substring(4);
    const x = "/pk";
    const y = "cód da consultora";
    const z = "cód de CN";

    if(pk_token === ''){
        enviarMensagens.enviarRespostaCasoVazia(ctx, x, y);
    }else{
        if(!funcoes.isNumber(pk_token)){
            enviarMensagens.enviarRespostaIfNotNumber(ctx, pk_token, z);
        } else if (autorizado){
            buscaToken.pk(ctx, bot, pk_token);
        }else{
            funcoes.autorizacaoNegada(ctx);
        }
    }
});

bot.onText(/\/lucra/, (ctx, match) => {
    const chatId = ctx.chat.id;
    const texto = ctx.text;
    var autorizado = funcoes.autorizacao(PessoasAutorizadas, chatId);
    var lucraPedido = texto.substring(6);
    const x = "/lucra";
    const y = "numero do pedido";

    if(lucraPedido === ''){
        enviarMensagens.enviarRespostaCasoVazia(ctx, x, y);
     }else{
         if(!funcoes.isNumber(lucraPedido)){
             enviarMensagens.enviarRespostaIfNotNumber(ctx, lucraPedido, y);
         } else if (autorizado){
             lucratividade.lucratividade_pedido(ctx, bot, lucraPedido);
         }else{
            funcoes.autorizacaoNegada(ctx);
         }
     }

});

bot.onText(/\/status/, (ctx,match) => {
    const chatId = ctx.chat.id;
    const texto = ctx.text;
    var autorizado = funcoes.autorizacao(PessoasAutorizadas, chatId);
    var pedido = texto.substring(8);
    const x = "/status";
    const y = "numero do pedido";

    if(pedido === ''){
        enviarMensagens.enviarRespostaCasoVazia(ctx, x, y);
    }else {
        if(!funcoes.isNumber(pedido)){
            enviarMensagens.enviarRespostaIfNotNumber(ctx, pedido, y);
        }else if (autorizado){
            statusPedido.status_ped(ctx, bot, pedido);
        } else{
            funcoes.autorizacaoNegada(ctx);
        }
    }
});

bot.onText(/\/cartao/, (ctx,match) => {
    const chatId = ctx.chat.id;
    const texto = ctx.text;
    var autorizado = funcoes.autorizacao(PessoasAutorizadas, chatId);
    var nm_pedido = texto.substring(7);
    const x = "/cartao";
    const y = "numero do pedido";

    if(nm_pedido === ''){
        enviarMensagens.enviarRespostaCasoVazia(ctx, x, y);
    }else {
        if (!funcoes.isNumber(nm_pedido)){
            enviarMensagens.enviarRespostaIfNotNumber(ctx, nm_pedido, y); 
        }else if(autorizado){
            autorizacaoBraspag.braspag(ctx,bot,nm_pedido);
            } else{
                funcoes.autorizacaoNegada(ctx);
            }
    }
});

bot.onText(/\/pts/, (ctx, match) => {
    const chatId = ctx.chat.id;
    const texto = ctx.text;
    var autorizado = funcoes.autorizacao(PessoasAutorizadas, chatId);
    var cd_consultora = texto.substring(4);
    const x = "/pts";
    const y = "cód da consultora";
    const z = "cód de CN";

    if(cd_consultora === ''){
        enviarMensagens.enviarRespostaCasoVazia(ctx, x, y);
    }else{
        if(!funcoes.isNumber(cd_consultora)){
            enviarMensagens.enviarRespostaIfNotNumber(ctx, cd_consultora, z);
        } else if (autorizado){
            pontuacao.pontuacao_disponivel(ctx, bot, cd_consultora);
        }else{
            funcoes.autorizacaoNegada(ctx);
        }
    }
})

bot.onText(/\/boleto/, (ctx, match) => {
    const chatId = ctx.chat.id;
    const texto = ctx.text;
    var autorizado = funcoes.autorizacao(PessoasAutorizadas, chatId);
    var num_pedido = texto.substring(7);
    const x = "/boleto";
    const y = "numero do pedido";

    if(num_pedido === ''){
        enviarMensagens.enviarRespostaCasoVazia(ctx, x, y);
    }else {

    if (!funcoes.isNumber(num_pedido)){
        enviarMensagens.enviarRespostaIfNotNumber(ctx, num_pedido, y);
    }/*else {
        vencboleto.venc_boleto(ctx, bot, num_pedido);
    }*/
    else if(autorizado){
        vencboleto.venc_boleto(ctx, bot, num_pedido);
        } else{
            funcoes.autorizacaoNegada(ctx);
        }
    }
});

// /pedidos_dia - Listar quantidade de pedidos dos últimos 30 dias
bot.onText(/\/pedidos_dia/, (ctx, match) => {
    const chatId = ctx.chat.id;
    var autorizado = funcoes.autorizacao(PessoasAutorizadasExecutarPedido, chatId);
    if(autorizado){
        pedidosdia.pedidos_dia(ctx, bot, true);
        } else{
            funcoes.autorizacaoNegada(ctx);
        }
});

bot.onText(/\/pedidos_hora/, (ctx, match) => {
    const chatId = ctx.chat.id;
    var autorizado = funcoes.autorizacao(PessoasAutorizadasExecutarPedido, chatId);
    if(autorizado){
        pedidoshora.pedidos_hora(ctx, bot, true);
        } else{
            funcoes.autorizacaoNegada(ctx);
        }
});

bot.onText(/\/pedidos_minuto/, (ctx, match) => {
    const chatId = ctx.chat.id;
    var autorizado = funcoes.autorizacao(PessoasAutorizadasExecutarPedido, chatId);
    if(autorizado){
        pedidosminuto.pedidos_minuto(ctx, bot, true);
        } else{
            funcoes.autorizacaoNegada(ctx);
        }
});

bot.on('text', (ctx) => {

    console.log('ctx', ctx);
    const chatId = ctx.chat.id;
    var autorizado = funcoes.autorizacao(PessoasAutorizadasExecutarPedido, chatId);

    a = ctx.text.split(" ");
     const comando = a[0];

    if (comando == '/start'){
        enviarMensagens.enviarBoasVindas(ctx);
    }else if (comando == '/boleto'){
        
    }else if(comando == '/cartao'){

    }else if (comando == '/pk'){

    }else if (comando == '/status'){

    }else if(comando == '/lucra'){

    }else if (comando == '/pts'){

    }else if (comando == '/pedidos_dia' || comando == '/pedidos_hora' || comando == '/pedidos_minuto'){
        if(autorizado){
            enviarMensagens.enviarMensagemDeEspera(ctx);
        }
    }else{
         enviarMensagens.enviarComandos(ctx);
    }

});