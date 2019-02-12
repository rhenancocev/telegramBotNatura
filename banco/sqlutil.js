var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');

//Number of rows to return from each call to getRows()
var numRows = 100;

module.exports = {
	executar_sql_o44prdg: function (sql_query, chatId, bot, caller, enviaImagem) {


		oracledb.getConnection(
			{
				user: dbConfig.user_o44prdg,
				password: dbConfig.password_o44prdg,
				connectString: dbConfig.connectString_o44prdg
			},
			function (err, connection) {
				if (err) {
					console.error(err.message);
					return;
				}
				connection.execute(
					// The statement to execute
					sql_query,

					// The "bind value" 180 for the bind variable ":id"
					[],

					// execute() options argument.  Since the query only returns one
					// row, we can optimize memory usage by reducing the default
					// maxRows value.  For the complete list of other options see
					// the documentation.
					{
						resultSet: true
						, maxRows: 100
						, outFormat: oracledb.OBJECT  // query result format
						, extendedMetaData: false      // get extra metadata
						, fetchArraySize: 100         // internal buffer allocation size for tuning
					},

					// The callback function handles the SQL execution results
					function (err, result) {
						if (err) {
							console.error(err.message);
							doRelease(connection);
							//doClose(connection,resultSet);
							bot.sendMessage(chatId, "Ocorreu um erro ao executar o comando!");
							eturn;
						}

							caller.fetchRowsFromRS(connection, result.resultSet, numRows, chatId, bot, enviaImagem);
						

						
					});
			});
	},
	executar_sql_o68pr: function (sql_query, chatId, bot, caller) {


		oracledb.getConnection(
			{
				user: dbConfig.user_o68pr,
				password: dbConfig.password_o68pr,
				connectString: dbConfig.connectString_o68pr
			},
			function (err, connection) {
				if (err) {
					console.error(err.message);
					return;
				}
				connection.execute(
					// The statement to execute
					sql_query,

					// The "bind value" 180 for the bind variable ":id"
					[],

					// execute() options argument.  Since the query only returns one
					// row, we can optimize memory usage by reducing the default
					// maxRows value.  For the complete list of other options see
					// the documentation.
					{
						resultSet: true
						, maxRows: 100
						, outFormat: oracledb.OBJECT  // query result format
						, extendedMetaData: false      // get extra metadata
						, fetchArraySize: 100         // internal buffer allocation size for tuning
					},

					// The callback function handles the SQL execution results
					function (err, result) {
						if (err) {
							console.error(err.message);
							doRelease(connection);
							//doClose(connection,resultSet);
							bot.sendMessage(chatId, "Ocorreu um erro ao executar o comando!");
							eturn;
						}

							caller.fetchRowsFromRS(connection, result.resultSet, numRows, chatId, bot);

					});
			});
	}
}

//Note: connections should always be released when not needed
function doRelease(connection) {
	connection.close(
		function (err) {
			if (err) {
				console.error(err.message);
			}
		});
};

function doClose(connection, resultSet) {
	resultSet.close(
		function (err) {
			if (err) { console.error(err.message); }
			doRelease(connection);
		});
};