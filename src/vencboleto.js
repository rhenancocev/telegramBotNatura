var oracledb = require('oracledb');
var dbConfig = require('../banco/dbconfig.js');
var sqlutil = require('../banco/sqlutil.js');
var query = require('../tools/query');
const moment = require('moment');

module.exports = {


  venc_boleto: function (ctx, bot, param) {

    var sql_query = query.queryVencBoleto(param);

    sqlutil.executar_sql_o44prdg(sql_query, ctx, bot, this);

  },

  fetchRowsFromRS: function (connection, resultSet, numRows, ctx, bot) {
    resultSet.getRows(
      numRows,  // get this many rows


      function (err, rows) {
        var retorno = "";
        var retornoPedido = "";
        var retornoBoleto = "";

        if (err) {
          console.error(err);
          doClose(connection, resultSet);   // always close the ResultSet
        } else if (rows.length <= 0){
          console.log("fetchRowsFromRS(): Got " + rows.length + " rows");
          
          retorno += "O pedido não é Boleto à Vista ou não existe no nosso banco de dados"
          bot.sendMessage(ctx.chat.id, "" + retorno);
        } 
        else if (rows.length > 0) {
          console.log("fetchRowsFromRS(): Got " + rows.length + " rows");


          
          for (var i = 0; i < rows.length; i++) {
            retorno += "" + moment(rows[i].DATA).format('DD-MM-YYYY');
            retornoPedido += rows[i].PEDIDO;
            retornoBoleto += moment(rows[i].DATA_BOLETO).format('DD-MM-YYYY');

          }

          console.log('Pedido: ' + retornoPedido + '\nData vencimento boleto' + retornoBoleto + '\nData cancelamento Pedido' + retorno);
          bot.sendMessage(ctx.chat.id, "Pedido: " + "<b>" + retornoPedido + "</b>"
                                     + "\n\nData vencimento do boleto: " + "<b>" + retornoBoleto + "</b>"
                                     + "\n\nData Cancelamento Pedido: " + "<b>" + retorno + "</b>", { parse_mode: "HTML" });

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