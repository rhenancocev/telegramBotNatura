var oracledb = require('oracledb');
var dbConfig = require('../banco/dbconfig.js');
var sqlutil = require('../banco/sqlutil.js');
const moment = require('moment');

module.exports = {


  pontuacao_disponivel: function (ctx, bot, param) {

    var sql_query = `SELECT CC.CD_PESSOA as CD_PESSOA, 
                            TPF.NO_COMPLETO as NO_COMPLETO, 
                            (CC.QT_PONTO_CREDITO_TOTAL - CC.QT_PONTO_CREDITO_COMPROMETIDO) AS QT_PONTO_DISPONIVEL,
                            CN.NO_NIVEL_ATUAL AS NIVEL
                        FROM SISCPT.CONSULTORA_CAPTACAO CC,
                             SISCAD.T_PESSOA_FISICA TPF,
                             SISCPT.CONSULTORA_NIVEIS CN
                        WHERE CC.CD_PESSOA = TPF.CD_PESSOA
                              AND CC.CD_PESSOA = CN.CD_PESSOA
                              AND DT_TERMINO_NIVEL_ATUAL IS NULL
                              AND CC.CD_PESSOA = ${param}`;

    sqlutil.executar_sql_o44prdg(sql_query, ctx, bot, this);

  },

  fetchRowsFromRS: function (connection, resultSet, numRows, ctx, bot) {
    resultSet.getRows(
      numRows,  // get this many rows


      function (err, rows) {
        var retornoCodPessoa = "";
        var retornoNoCompleto = "";
        var retornoPontoDisponivel = "";
        var retornoNivel = "";
        const texto = ctx.text;
        var cd_consultora = texto.substring(4);

        if (err) {
          console.error(err);
          doClose(connection, resultSet);   // always close the ResultSet
        } else if (rows.length <= 0){
          console.log("fetchRowsFromRS(): Got " + rows.length + " rows");
          
          bot.sendMessage(ctx.chat.id, "A CN " + "<b>" + cd_consultora + "</b>" + ", não existe no nosso banco de dados!", {parse_mode: "HTML"});
        } 
        else if (rows.length > 0) {
          console.log("fetchRowsFromRS(): Got " + rows.length + " rows");
          
          for (var i = 0; i < rows.length; i++) {
            
            retornoCodPessoa        += rows[i].CD_PESSOA;
            retornoNoCompleto       += rows[i].NO_COMPLETO;
            retornoNivel            += rows[i].NIVEL;
            retornoPontoDisponivel  += rows[i].QT_PONTO_DISPONIVEL;
            

          }

          console.log('cd_pessoa: ' + retornoCodPessoa + '\nNome' + retornoNoCompleto + '\nponto' + retornoPontoDisponivel);
          bot.sendMessage(ctx.chat.id, "Código da CN: " + "<b>" + retornoCodPessoa + "</b>"
                                     + "\nNome da CN: " + "<b>" + retornoNoCompleto + "</b>"
                                     + "\nNivel atual da CN: " + "<b>" + retornoNivel + "</b>"
                                     + "\nPontuação disponivel para CN captar pedido: " + "<b>" + retornoPontoDisponivel + "</b>", { parse_mode: "HTML" });

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