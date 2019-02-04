var oracledb = require('oracledb');
var dbConfig = require('../banco/dbconfig.js');
var sqlutil = require('../banco/sqlutil.js');
const moment = require('moment');

module.exports = {
//48255246

  braspag: function (ctx, bot, param) {

    var sql_query = `select p.id_order as NM_PEDIDO, 
                            (select max(ts1.dt_transacao) 
                                    from sispgt.transacao_status ts1 
                                      where ts1.id_trans_payload = ts.id_trans_payload) as DATA_TRANSACAO,
                            p.vr_pagamento as VALOR_PAGAMENTO,
                            ts.ds_mensagem_adquirente as MOTIVO_CANCELAMENTO
                    from sispgt.pagamentos p,
                    sispgt.transacao_status ts
                    where p.id_trans_payload = ts.id_trans_payload
                    and p.id_order =  ${param}
                    and rownum = 1
                    order by ts.dt_transacao`;

    sqlutil.executar_sql_o68pr(sql_query, ctx, bot, this);

  },

  fetchRowsFromRS: function (connection, resultSet, numRows, ctx, bot) {
    resultSet.getRows(
      numRows,  // get this many rows


      function (err, rows) {
        var retorno = "";
        var pedido = "";
        var data = "";
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


          
          for (var i = 0; i < rows.length; i++) {
            pedido += rows[i].NM_PEDIDO;
            data += moment(rows[i].DATA_TRANSACAO).format('DD-MM-YYYY, h:mm:ss a');
            motivoCancelamento += rows[i].MOTIVO_CANCELAMENTO;
            valorPagamento += rows[i].VALOR_PAGAMENTO;


          }
            
          console.log('PK:' + retorno);
          bot.sendMessage(ctx.chat.id, "Pedido: " + "<b>" + pedido + "</b>" 
                                      + "\n\nData: " + "<b>" + data + "</b>"
                                      + "\n\nValor da transação: " + "<b>" + valorPagamento + "</b>"
                                      +  "\n\nÚltimo status recebido da braspag: "  + "<b>" + motivoCancelamento + "</b>", { parse_mode: "HTML"});

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