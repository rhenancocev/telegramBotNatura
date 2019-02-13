var oracledb = require('oracledb');
var dbConfig = require('../banco/dbconfig.js');
var sqlutil = require('../banco/sqlutil.js');
var query = require('../tools/query');
const moment = require('moment');

module.exports = {
//48255246

  braspag: function (ctx, bot, param) {

    var sql_query = query.queryAutorizacaoBraspag(param);

    sqlutil.executar_sql_o68pr(sql_query, ctx, bot, this);

  },

  fetchRowsFromRS: function (connection, resultSet, numRows, ctx, bot) {
    resultSet.getRows(
      numRows,  // get this many rows


      function (err, rows) {
        var retorno = "";
        var pedido = "";
        var motivoCancelamento = "";
        var valorPagamento = ""

        if (err) {
          console.error(err);
          doClose(connection, resultSet);   // always close the ResultSet
        } else if (rows.length <= 0){
          console.log("fetchRowsFromRS(): Got " + rows.length + " rows");
          
          retorno += "O pedido informado não existe no nosso banco de dados ou não houve retorno da Braspag.";
          bot.sendMessage(ctx.chat.id, "" + retorno);
        } 
        else if (rows.length > 0) {
          console.log("fetchRowsFromRS(): Got " + rows.length + " rows");


          pedido += rows[0].NM_PEDIDO;
          valorPagamento += rows[0].VALOR_PAGAMENTO;

          for (var i = 0; i < rows.length; i++) {
            
            motivoCancelamento += "\n " + moment(rows[i].DATA_TRANSACAO).format('DD-MM-YYYY, h:mm:ss a') + " - " + rows[i].MOTIVO_CANCELAMENTO + " ";
          }
            
          console.log('PK:' + retorno);
          bot.sendMessage(ctx.chat.id, "Pedido: " + "<b>" + pedido + "</b>"
                                      + "\n\nValor da transação: " + "<b>" + valorPagamento + "</b>"
                                      +  "\n\nStatus recebido da braspag: "  + "<b>" + motivoCancelamento + "</b>", { parse_mode: "HTML"});

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