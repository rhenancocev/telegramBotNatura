var oracledb = require('oracledb');
var dbConfig = require('../banco/dbconfig.js');
var sqlutil = require('../banco/sqlutil.js');
const moment = require('moment');

module.exports = {

/*
 * pedidos_dia - Listar quantidade de pedidos dos últimos 30 dias
 */
	pedidos_hora: function(ctx, bot, enviaImagem)  {
	
		var sql_query = `select TRUNC(p.DT_FINALIZACAO_PEDIDO, 'HH24') as HORA, count(p.NM_PEDIDO) as PEDIDOS from SISCPT.PEDIDO p
		where
			trunc(p.DT_FINALIZACAO_PEDIDO) = trunc(sysdate)
			and p.ID_SITUACAO_PEDIDO in (3, 17)
			and p.nm_ciclo_pedido in (select co.nm_ciclo_operacional from siscpt.t_ciclo_operacional co
																		 where co.cd_tipo_estrutura_comercial = 0 
																		 and trunc(sysdate) between trunc(co.dt_inicio_ciclo) 
																		 and trunc (co.dt_termino_ciclo)
																		 and co.nm_ciclo_operacional = p.nm_ciclo_pedido)
			and p.cd_canal_captacao IN (1, 8, 11)
		group by TRUNC(p.DT_FINALIZACAO_PEDIDO, 'HH24')
		order by 1 asc`;

		
	sqlutil.executar_sql_o44prdg(sql_query, ctx, bot, this, enviaImagem);
},


fetchRowsFromRS: function (connection, resultSet, numRows, ctx, bot, enviaImagem) {
	  resultSet.getRows(
	    numRows,  // get this many rows
	    function (err, rows) {
	      if (err) {
	        console.error(err);
	        doClose(connection, resultSet);   // always close the ResultSet
	      } else if (rows.length > 0) {
	        console.log("fetchRowsFromRS(): Got " + rows.length + " rows");
			
	        var eixoX = [];
	        var eixoY = [];
	        
	        var retorno = "";
			for (var i = 0; i < rows.length; i++) {
				retorno += "" + moment(rows[i].HORA).format('h:mm a') + " --> " + rows[i].PEDIDOS + " Pedidos\n";

				eixoX[i] = moment(rows[i].HORA).format('h:mm a');
				eixoY[i] = rows[i].PEDIDOS;
			}
			
			if (enviaImagem) {
				
			    var plotly = require('plotly')("cidalhi", "Omi3mOW713dypAiQnbsp");
			    
			    var fs = require('fs');
	
			    var trace1 = {
			      x: eixoX,
			      y: eixoY,
			      type: "bar",
			      mode:'lines+markers'
			    };
			    
			    let layout = {  // Chart Layout
			            title: ctx.from.first_name + ': Pedidos por Hora de hoje',   // Chart Title
			            xaxis: {
			                title: 'Hora'    // X axis title
			            },
			            yaxis: {
			              title: 'Pedidos'  // Y axis title
			            }
			        };
	
			    var figure = { 'data': [trace1], layout: layout  };
	
			    var imgOpts = {
			        format: 'png',
			        width: 1000,
			        height: 500
			    };
			    
			    var fileName = 'hora' + ctx.chat.id + '.png';
	
			    plotly.getImage(figure, imgOpts, function (error, imageStream) {
			        if (error) return;
	
			        console.log('aqui');
			        
			        var fileStream = fs.createWriteStream(fileName);
				        
			        console.log('aqui9');
				        
				        fileStream.on('finish', () => {
					     	   bot.sendMediaGroup(ctx.chat.id, [
					     	        {
					     	          type: 'photo',
					     	          //media: layout
					     	          media: fileName,
					     	        },
					     	      ], {
					     	        disable_notification: true,
					     	      });
				        	});
				        
				        imageStream.pipe(fileStream);
	
			        
			    });
			} else {
				
				bot.sendMessage(ctx.chat.id, "" + retorno);
			}
		    

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
    function(err) {
      if (err) {
        console.error(err.message);
      }
    });
}

function doClose(connection, resultSet) {
	  resultSet.close(
	    function(err) {
	      if (err) { console.error(err.message); }
	      doRelease(connection);
	    });
	}

