var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');
var sqlutil = require('./sqlutil_o68pr.js');
const moment = require('moment');

module.exports = {
//48255246

  braspag: function (ctx, bot, param) {

    var sql_query = `select p.id_order as NM_PEDIDO, 
                            ts.dt_transacao AS DATA_TRANSACAO,
                            ts.ds_mensagem_adquirente as MOTIVO_CANCELAMENTO
                    from sispgt.pagamentos p,
                    sispgt.transacao_status ts
                    where p.id_trans_payload = ts.id_trans_payload
                    and p.id_order =  ${param}
                    and ts.ds_mensagem_adquirente <> 'Success.'
                    order by ts.dt_transacao`;

    sqlutil.executar_sql_o68pr(sql_query, ctx, bot, this);

  },

  fetchRowsFromRS: function (connection, resultSet, numRows, ctx, bot) {
    resultSet.getRows(
      numRows,  // get this many rows


      function (err, rows) {
        var retorno = "";
        if (err) {
          console.error(err);
          doClose(connection, resultSet);   // always close the ResultSet
        } else if (rows.length <= 0){
          console.log("fetchRowsFromRS(): Got " + rows.length + " rows");
          
          retorno += "O pedido informado não existe no nosso banco de dados ou não ouve retorno da Braspag para o pedido informado";
          bot.sendMessage(ctx.chat.id, "" + retorno);
        } 
        else if (rows.length > 0) {
          console.log("fetchRowsFromRS(): Got " + rows.length + " rows");


          
          for (var i = 0; i < rows.length; i++) {
            retorno += " \n\n" + "PEDIDO --> " + rows[i].NM_PEDIDO
                        + "\n\n" + "DATA --> " + moment(rows[i].DATA_TRANSACAO).format('DD-MM-YYYY, h:mm:ss a')
                        + "\n\n" + "MOTIVO CANCELAMENTO --> " + rows[i].MOTIVO_CANCELAMENTO;

          }

          console.log('PK:' + retorno);
          bot.sendMessage(ctx.chat.id, "" + retorno);

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