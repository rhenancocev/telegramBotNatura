var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');
var sqlutil = require('./sqlutil_o44prdg.js');
const moment = require('moment');

module.exports = {


  status_ped: function (ctx, bot, param) {

    var sql_query = `select nm_pedido as PEDIDO,
    decode (id_situacao_pedido, 
    1, 'Em Andamento',
    2, 'Captação Cancelada',
    3, 'Captado OK',
    4, 'Pendente Débito Atrasado',
    5, 'Pendente Limite Crédito',
    6, 'Pendente Estoque',
    7, 'Pendente de confirmação de pagamento',
    8, 'Pendente Débito Lim.Crédi',
    9, 'Pendente Débito Estoque',
    10, 'Pendente Crédito Estoque',
    11, 'Pend Déb Crédito Estoque',
    12, 'Cancelado por Débito',
    13, 'Cancelado por Crédito',
    14, 'Cancelado por CN',
    15, 'Cancelado "SAP"',
    16, 'Cancelado por pt.mínimos',
    17, 'Enviado para Faturamento',
    18, 'Em Análise de Crédito',
    19, 'Passível de Recuperação',
    20, 'Passível de Remoção',
    24, 'Cancelado por não aprovação' ) as STATUS_PEDIDO, 
nm_ciclo_pedido as CICLO_PEDIDO,
decode (cd_sistema_origem,
1, 'CONECTA',
4, 'CAPTA WEB',
5, 'APP NATURA',
NULL, 'CAPTA CAN') as SISTEMA_ORIGEM
from siscpt.pedido where nm_pedido = ${param}
and cd_canal_captacao <> 16`;

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