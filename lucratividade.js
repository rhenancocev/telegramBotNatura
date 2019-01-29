var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');
var sqlutil = require('./sqlutil_o44prdg.js');
const moment = require('moment');

module.exports = {


  lucratividade_pedido: function (ctx, bot, param) {

    var sql_query = `select replace (round ((sum(vl_unitario_tabela) - sum(vl_unitario_sem_lucratividade))/sum(vl_unitario_tabela),2),'.','')||'%' as LUCRATIVIDADE,
    nm_pedido as PEDIDO
from siscpt.item_pedido
where nm_pedido = ${param}   
and id_origem_item_pedido = 1
and (vl_unitario_tabela - vl_unitario_sem_lucratividade)/vl_unitario_tabela > 0
group by nm_pedido`;

    sqlutil.executar_sql_o44prdg(sql_query, ctx, bot, this);

  },

  fetchRowsFromRS: function (connection, resultSet, numRows, ctx, bot) {
    resultSet.getRows(
      numRows,  // get this many rows


      function (err, rows) {
        var retorno = "";
        var retornoPedido = "";
        var retornoLucratividade = "";
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

          }

          console.log('Numero do Pedido: ' + retorno);
          bot.sendMessage(ctx.chat.id, "Pedido: " + "<b>" + retornoPedido + "</b>"
                                     + "\nLucratividade: " + "<b>" + retornoLucratividade + "</b>", { parse_mode: "HTML" });

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