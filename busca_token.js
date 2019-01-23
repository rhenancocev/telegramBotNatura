var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');
var sqlutil = require('./sqlutil_o68pr.js');
const moment = require('moment');

module.exports = {
//48255246

  pk: function (ctx, bot, param) {

    var sql_query = `SELECT PK_PAGSEGURO as PAGSEGURO
    FROM (SELECT AUT.PK_PAGSEGURO
        FROM SISMPGTO.T_CADASTRO_MPOS CAD,                         
              SISMPGTO.T_NOTIFICACAO   NOTI,
              SISMPGTO.T_AUTORIZACAO   AUT
        WHERE CAD.CD_CADASTRO_MPOS = NOTI.CD_CADASTRO_MPOS
        AND AUT.CD_NOTIFICACAO = NOTI.CD_NOTIFICACAO
        AND CAD.CD_CONSULTORA = ${param}
        ORDER BY CAD.DT_CRIACAO DESC)
        WHERE ROWNUM=1`;

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
          
          retorno += "Não existe PK para a consultora digitada!";
          bot.sendMessage(ctx.chat.id, "" + retorno);
        } 
        else if (rows.length > 0) {
          console.log("fetchRowsFromRS(): Got " + rows.length + " rows");


          
          for (var i = 0; i < rows.length; i++) {
            retorno += "A PK referente a consultora: " + " PK --> " + rows[i].PAGSEGURO;

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