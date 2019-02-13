var oracledb = require('oracledb');
var dbConfig = require('../banco/dbconfig.js');
var sqlutil = require('../banco/sqlutil.js');
var query = require('../tools/query');
const moment = require('moment');

module.exports = {


  status_ped: function (ctx, bot, param) {

    var sql_query = query.queryStatusPedido(param);

    sqlutil.executar_sql_o44prdg(sql_query, ctx, bot, this);

  },

  fetchRowsFromRS: function (connection, resultSet, numRows, ctx, bot) {
    resultSet.getRows(
      numRows,  // get this many rows


      function (err, rows) {
        var retorno = "";
        var pedFinal = "";
        var statusfinal = "";
        var ciclofinal = "";
        var sistemaOrigemFinal = "";

        if (err) {
          console.error(err);
          doClose(connection, resultSet);   // always close the ResultSet
        } else if (rows.length <= 0){
          console.log("fetchRowsFromRS(): Got " + rows.length + " rows");
          
          retorno += "O pedido não é do capta ou não existe no nosso banco de dados"
          bot.sendMessage(ctx.chat.id, "" + retorno);
        } 
        else if (rows.length > 0) {
          console.log("fetchRowsFromRS(): Got " + rows.length + " rows");


          
          for (var i = 0; i < rows.length; i++) {
            pedFinal += rows[i].PEDIDO;
            statusfinal += rows[i].STATUS_PEDIDO;
            ciclofinal += rows[i].CICLO_PEDIDO;
            sistemaOrigemFinal += rows[i].SISTEMA_ORIGEM;


          }
          
          bot.sendMessage(ctx.chat.id, "Pedido: " + "<b>" + pedFinal + "</b>" 
                                + "\n\n Status do Pedido: " + "<b>" + statusfinal + "</b>"
                                + "\n\n Ciclo do Pedido: " + "<b>" + ciclofinal + "</b>"
                                + "\n\n Sitema Origem: " + "<b>" + sistemaOrigemFinal + "</b>",  { parse_mode: "HTML" });

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