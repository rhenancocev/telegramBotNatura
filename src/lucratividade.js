var oracledb = require('oracledb');
var dbConfig = require('../banco/dbconfig.js');
var sqlutil = require('../banco/sqlutil.js');
const moment = require('moment');

module.exports = {


  lucratividade_pedido: function (ctx, bot, param) {

    var sql_query = `select replace (round ((sum(ip.vl_unitario_tabela) - sum(ip.vl_unitario_sem_lucratividade))/sum(ip.vl_unitario_tabela),2)*100,'.','')||'%' as LUCRATIVIDADE,
    ip.nm_pedido as PEDIDO,
    nc.no_nivel as NIVEL_PEDIDO_FINALIZADO,
    ip.nm_ciclo_pedido as CICLO
    from siscpt.item_pedido ip,
         siscpt.pedido_niveis_cn nc
    where ip.nm_pedido = ${param}   
    and ip.id_origem_item_pedido = 1
    and ip.nm_pedido = nc.nm_pedido
    and ip.nm_ciclo_pedido = nc.nm_ciclo_pedido
    and (ip.vl_unitario_tabela - ip.vl_unitario_sem_lucratividade)/ip.vl_unitario_tabela > 0
    group by ip.nm_pedido, NC.NO_NIVEL, ip.nm_ciclo_pedido`;

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
                                     + "\nCiclo do pedido: " + "<b>" + retornoCiclo + "</b>"
                                     + "\nLucratividade: " + "<b>" + retornoLucratividade + "</b>"
                                     + "\nNivel do pedido: " + "<b>" + retornoNivel + "</b>", { parse_mode: "HTML" });

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