var oracledb = require('oracledb');
var dbConfig = require('../banco/dbconfig.js');
var sqlutil = require('../banco/sqlutil.js');
var query = require('../tools/query');
const moment = require('moment');

module.exports = {


  lucratividade_pedido: function (ctx, bot, param) {

    var sql_query = query.queryLucratividade(param);

    sqlutil.executar_sql_o44prdg(sql_query, ctx, bot, this);

  },

  fetchRowsFromRS: function (connection, resultSet, numRows, ctx, bot) {
    resultSet.getRows(
      numRows,  // get this many rows


      function (err, rows) {
        var retorno = "";
        var retornoPedido = "";
        var retornoLucratividade = "";
        var retornoNivel = "";
        var retornoCiclo = "";

        if (err) {
          console.error(err);
          doClose(connection, resultSet);   // always close the ResultSet
        } else if (rows.length <= 0){
          console.log("fetchRowsFromRS(): Got " + rows.length + " rows");
          
          retorno += "O pedido está cancelado/Em andamento ou não existe no nosso banco de dados"
          bot.sendMessage(ctx.chat.id, "" + retorno);
        } 
        else if (rows.length > 0) {
          console.log("fetchRowsFromRS(): Got " + rows.length + " rows");

          
          for (var i = 0; i < rows.length; i++) {
            retornoLucratividade += rows[i].LUCRATIVIDADE;
            retornoPedido += rows[i].PEDIDO;
            retornoNivel += rows[i].NIVEL_PEDIDO_FINALIZADO;
            retornoCiclo += rows[i].CICLO;

          }

          console.log('Numero do Pedido: ' + retorno);
          bot.sendMessage(ctx.chat.id, "Pedido: " + "<b>" + retornoPedido + "</b>"
                                     + "\n\nCiclo do pedido: " + "<b>" + retornoCiclo + "</b>"
                                     + "\n\nLucratividade: " + "<b>" + retornoLucratividade + "</b>"
                                     + "\n\nNivel do pedido: " + "<b>" + retornoNivel + "</b>", { parse_mode: "HTML" });

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