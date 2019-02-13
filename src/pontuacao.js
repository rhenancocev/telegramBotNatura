var oracledb = require('oracledb');
var dbConfig = require('../banco/dbconfig.js');
var sqlutil = require('../banco/sqlutil.js');
var query = require('../tools/query');
const moment = require('moment');

module.exports = {


  pontuacao_disponivel: function (ctx, bot, param) {

    var sql_query = query.queryPontuacao(param);

    sqlutil.executar_sql_o44prdg(sql_query, ctx, bot, this);

  },

  fetchRowsFromRS: function (connection, resultSet, numRows, ctx, bot) {
    resultSet.getRows(
      numRows,  // get this many rows


      function (err, rows) {
        var retornoCodPessoa                        = "";
        var retornoNoCompleto                       = "";
        var retornoPontoDisponivel                  = "";
        var retornoNivel                            = "";
        var retornoCreditoExcedente                 = "";
        var retornoCreditoAdicional                 = "";
        var retornoCreditoComprometido              = "";
        var retornoCreditoTotalExcedente            = "";
        var retornoCredidotTotalAdicional           = "";
        var retornoCreditoTotalExcedenteEAdicional  = "";
        const texto = ctx.text;
        var cd_consultora = texto.substring(4);

        if (err) {
          console.error(err);
          doClose(connection, resultSet);   // always close the ResultSet
        } else if (rows.length <= 0){
          console.log("fetchRowsFromRS(): Got " + rows.length + " rows");
          
          bot.sendMessage(ctx.chat.id, "A CN " + "<b>" + cd_consultora + "</b>" + ", não existe no nosso banco de dados!", {parse_mode: "HTML"});
        } 
        else if (rows.length > 0) {
          console.log("fetchRowsFromRS(): Got " + rows.length + " rows");
          
          for (var i = 0; i < rows.length; i++) {
            
            retornoCodPessoa                        += rows[i].CD_PESSOA;
            retornoNoCompleto                       += rows[i].NO_COMPLETO;
            retornoNivel                            += rows[i].NIVEL;
            retornoPontoDisponivel                  += rows[i].QT_PONTO_DISPONIVEL;
            retornoCreditoExcedente                 += rows[i].PC_CREDITO_EXCEDENTE;
            retornoCreditoAdicional                 += rows[i].PC_CREDITO_ADICIONAL;
            retornoCreditoComprometido              += rows[i].CREDITO_COMPROMETIDO;
            retornoCreditoTotalExcedente            += rows[i].CREDITO_TOTAL_EXCEDENTE;
            retornoCredidotTotalAdicional           += rows[i].CREDITO_TOTAL_ADICIONAL;
            retornoCreditoTotalExcedenteEAdicional  += rows[i].CREDITO_TOTAL_ADI_EXCE;

          }

          console.log('cd_pessoa: ' + retornoCodPessoa + '\nNome' + retornoNoCompleto + '\nponto' + retornoPontoDisponivel);
          bot.sendMessage(ctx.chat.id, "Código da CN: " + "<b>" + retornoCodPessoa + "</b>"
                                     + "\n\nNome da CN: " + "<b>" + retornoNoCompleto + "</b>"
                                     + "\n\nNivel atual da CN: " + "<b>" + retornoNivel + "</b>"
                                     + "\n\nPorcentagem de crédito excedente: " + "<b>" + retornoCreditoExcedente + "</b>"
                                     + "\n\nPorcentagem de crédito adicional: " + "<b>" + retornoCreditoAdicional + "</b>"
                                     + "\n\nPontuação disponivel para CN captar pedido: " + "<b>" + retornoPontoDisponivel + "</b>"
                                     + "\n\nPontuação comprometida: " + "<b>" + retornoCreditoComprometido + "</b>"
                                     + "\n\nPontuação total com o crédito " + "<b>excedente: </b>" + "<b>" + retornoCreditoTotalExcedente + "</b>"
                                     + "\n\nPontuação total com o crédito " + "<b>adicional: </b>" + "<b>" + retornoCredidotTotalAdicional + "</b>"
                                     + "\n\nPontuação total com o crédito " + "<b>excedente e adicional: </b>" + "<b>" + retornoCreditoTotalExcedenteEAdicional + "</b>", { parse_mode: "HTML" });

          if (rows.length === numRows)      // might be more rows
            fetchRowsFromRS(connection, resultSet, numRows);
          else
            doClose(connection, resultSet); // always close the ResultSet
        } else { // no rows
          doClose(connection, resultSet);   // always close the ResultSet
        }
      });
  }

};

//Note: connections should always be released when not needed
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