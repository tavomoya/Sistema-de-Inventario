var d = require('domain').create();

d.on('error', function (er) {

	//Imprimir el error por consola
	console.log('----ERROR----');
	console.error(er.message);
	console.error(er.stack);

	// Declarar la variable express
	var express = require('express'),
		app = express(),
		config = require('./config').init(app),
		db = require('monk')(config.DB_URL, config.serverOptions);

	// Objeto que almacena la informacion del error
	var error = {
		fecha: new Date(),
		mensaje: er.message,
		stack: er.stack
	};

	// Almacenar el error en la base de datos.
	db.get('LOGERROR').insert(error, function (err) {
		if (err) {
			//Poner error en archivo log-dia
			var fs = require('fs');
			var urlfs = __dirname + "/log/log-" + new Date().getFullYear() + "-" + (parseInt(new Date().getMonth()) + 1) + "-" + new Date().getDate() + ".txt";
			var txtError = "Fecha: " + error.fecha + ", Mensaje: " + error.mensaje + ", Stack: " + error.stack + "\n";
			fs.appendFile(urlfs, txtError, function (err) {
				if (err) {
					console.log(err);
				} else {
					console.log("The log was saved in " + urlfs);
				}
			});
		}
	});

});


d.run(function () {

	var express = require('express'),
		users = require('./controllers/users'),
		campana = require('./controllers/campana'),
		usuario = require('./controllers/usuario'),
		dashboard = require('./controllers/dashboard'),
		mantenimiento = require('./controllers/mantenimiento'),
		gestiones = require('./controllers/gestiones'),
		util = require('./controllers/util'),
		jwt = require('jsonwebtoken'),
		auth = require('express-jwt'),
		http = require('http'),
		validator = require('express-validator'),
		cron = require('cron').CronJob,
		path = require('path'),
		app = express(),
		config = require('./config').init(app),
		db = require('monk')(config.DB_URL),
		jLinq = require('jlinq'),
		secret = "asd243131",
		nodeSql = require('./controllers/nodeSql'),
		MongoClient = require('mongodb').MongoClient,
		clienteCampana = require('./controllers/clienteCampana'),
		q = require('q');

	app.configure(function () {
		app.use(express.logger());
		app.use(express.methodOverride());
		app.use('/api', auth({
			secret: secret
		}));
		app.use(express.json());
		app.use(express.urlencoded());
		app.use(validator());
		app.use(app.router);
		app.use(express.responseTime());
		app.use(express.compress());
		app.use(express.favicon());
		app.use('/', express.static(path.join(__dirname, 'public/app')));
	});

	app.configure('development', function () {
		app.use(express.errorHandler({
			dumpExceptions: true,
			showStack: true
		}));
	});

	app.configure('testing', function () {
		app.use(express.errorHandler());
	});

	app.configure('production', function () {
		app.use(express.errorHandler());
	});


	//kmdc?sdsd;
	//throw new Error('something bad happened');

	//Test Error
	/* app.post('/thtowAnError', mantenimiento.throwAnError(db));*/

	//Util
	app.post('/obtenerSecuencia', util.getSecuencia(db));
	app.post('/util/secuencia', util.getSecuencia(db));
	app.get('/obtenerListas', util.getListas(db));
	app.post('/util/listas', util.getListas(db));

	//Mantenimiento
	app.post('/mantenimiento/buscarPorId', mantenimiento.buscarPorId(db));
	app.post('/mantenimiento/new', mantenimiento.new(db));
	app.post('/mantenimiento/delete', mantenimiento.delete(db));
	app.post('/mantenimiento/update', mantenimiento.update(db));
	app.post('/mantenimiento/upsert', mantenimiento.upsert(db));
	app.post('/mantenimiento/search', mantenimiento.search(db));
	app.post('/mantenimiento/count', mantenimiento.count(db));
	
	//Gestiones
	app.post('/gestiones/updClienteCamp', gestiones.updateOfficial(db));
	app.post('/gestiones/buscarUsJerarquia', gestiones.getUsersHierarchy(db));
	app.post('/gestiones/actualizarManager', gestiones.updateManagers(db));

	//Parameters
	//Tabla: name of the colletion
	//limit: number of records
	//skip: number of records to be skipped
	//sort: object with the fields in which the query is going to be sorted
	//filter: filter that is gonna be used, must be passed as a String
	//search: a string that is going to be look in a set of fields
	//fields: array of strings with the fields names that the 'search' attribute is going to be looked in
	app.post('/mantenimiento/paginatedSearch', mantenimiento.paginatedSearch(db));
	app.post('/api/mantenimiento/paginatedSearch', mantenimiento.paginatedSearch(db));

	//Carga de Campana
	app.post('/campana/process', campana.process(db));

	//Dashboard
	app.post('/api/dashboard/filtros', dashboard.filtros(db));
	app.post('/api/dashboard', dashboard.getIndicators(config.DB_URL, db));
	app.post('/api/dashboard/getTodayCalls', dashboard.getTodayCalls(db));

	//ClienteCampana
	app.post('/api/clientecampana/guardarOportunidad', clienteCampana.guardarOportunidad(db));
	app.post('/api/clientecampana/guardarActividad', clienteCampana.guardarActividad(db));

	//Prospectos
	app.post('/api/prospectos/buscarPorId', function (req, res) {
		where = req.body.query;
		if (req.body.user.rol == "Administrador") {
			where["usuarioId"] = {
				$in: req.body.user.oficiales || []
			};
			where["usuarioId"].$in.push(req.body.user.usuarioId) 	;
		} else {
			where["usuarioId"] = req.body.user.usuarioId;
		}
		db.get(req.body.tabla).findOne(where, function (err, obj) {
			res.json(obj);
		})
	});
	app.post('/api/prospectos/count', function (req, res) {
		where = {};
		if (req.body.user.rol == "Administrador") {
			console.log('here')
			where["oficialId"] = {
				$in: req.body.user.oficiales || []	
			};
			where["oficialId"].$in.push(req.body.user.usuarioId);
		}
		else {
			where["oficialId"] = req.body.user.usuarioId;
		}
		db.get("CLIENTECAMPANA").count({
				tasaDeContacto: {
					$exists: req.body.contactado
				},
				oficialId: where["oficialId"]
			},
			function (err, campanas) { 
				res.json(campanas);
			});
	});

	//Campañas
	app.get('/campana/get', campana.getCampana(db));
	app.post('/campana/getByID', campana.getCampanaByID(db));
	app.post('/campana/getPendingProspects', campana.getPendingProspects(config.DB_URL, db));

	//My SQL
 app.post('/sql/LoadClient', nodeSql.executeQueryInsertClient(db));
 app.post('/sql/loadOfficial', nodeSql.executeQueryInsertOfficial(db));
 app.post('/sql/loadCampaign', nodeSql.executeQueryInsertCustomerCampaignQueries(db));
 //Para ClienteCampaña
 //var sqlCustomerCampaignQueries = ['SELECT * FROM clienteCampana order by clienteId, campanaId', 'SELECT * FROM ClienteCampanaOferta order by clienteId, campanaId'];
  //nodeSql.executeQueryInsertCustomerCampaignQueries(db, sqlCustomerCampaignQueries, 'CLIENTECAMPANA' );// Para hacer pruebas
 //Para los oficiales
  //var sqlOfficialQueries = ['SELECT * FROM oficial'];
  //nodeSql.executeQueryInsertOfficial(db, sqlOfficialQueries, 'USUARIO' );// Para hacer pruebas
 //Para los clientes
  //	var sqlClientQueries  = ['SELECT * FROM cliente where clienteid < 2000 order by clienteId', 'SELECT * from clienteTelefono where clienteid < 2000 order by clienteId','SELECT * FROM clienteProducto where clienteId < 2000 order by clienteId','SELECT * FROM clienteProductoSugerido where clienteId < 2000 order by clienteId']; 
   // nodeSql.executeQueryInsertClient(db, sqlClientQueries, 'CLIENTE' );// Para hacer pruebas
 

	//nodeSql.executeQueryInsert(db, 'select * from clienteproducto;', 'CLIENTEPRODUCTO' );// Para  cargar en la tabla CLIENTEPRODUCTO
	//nodeSql.executeQueryInsert(db, 'select * from cliente;', 'CLIENTE' );// Para  cargar en la tabla Cliente
	//nodeSql.queryInsertPhones(db, 'select * from ClienteTelefono;', 'CLIENTE' );// Para  cargar los telefonos a los clientes
	//nodeSql.queryInsertPhones(db, 'select  * from ClienteTelefono', 'testAriel' );// Para  cargar los telefonos a los clientes
	//nodeSql.executeQueryInsert(db, 'select * from cliente', 'testAriel' );// Para hacer pruebas

	//  var sqlQueries  = ['SELECT * FROM cliente where clienteid < 800000 order by clienteId', 'SELECT * from clienteTelefono where clienteid < 800000 order by clienteId','SELECT * FROM clienteProducto where clienteId < 800000 order by clienteId','SELECT * FROM clienteProductoSugerido where clienteId < 800000 order by clienteId']; 
	// nodeSql.executeQueryInsertTest(db, sqlQueries, 'testAriel' );// Para hacer pruebas


	//Usuarios
	app.get('/usuario/listas', usuario.getListas(db));
	app.get('/usuario/get', usuario.getUsuario(db));
	app.post('/usuario/count', usuario.usuarioCount(db));


	//-- ROUTES
	app.get('/api/routes', function (req, res) {
		res.send(app.routes);
	});
	app.post('/login', users.authenticate(db, secret, jwt));
	app.post('/signup', users.signup(db)); //DONE 
	app.post('/api/profile', users.update(db));
	app.get('/confirm/email/:token', users.confirmEmail(db)); //DONE 
	app.get('/api/profile', users.profile(db));
	//app.get('/profile/:id/:token', users.profile);
	//app.post('/account', isLoggedIn, users.validate, users.update);

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//***********************************************CRON****************************************

	//Seconds: 0-59, Minutes: 0-59, Hours: 0-23, Day of Month: 1-31, Months: 0-11, Day of Week: 0-6
	//new cron('00 00 23 * * *',
	new cron('0 0 0 * * *',
		function () {
			console.log('[*] Cron job started');
			console.log('[*] A las: ' + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds());
			console.log('[*] El dia: ' + new Date().getDate() + "/" + (parseInt(new Date().getMonth()) + 1) + "/" + new Date().getFullYear());

			var settings = {},
				campana = {},
				// Arreglo de clientes que seran insertados en la coleccion ClienteCampana
				clienteCampanaList = [],
				// Arreglo de oficiales
				officialList = [],
				// Fecha de vencimiento con la cual se compararan las fecha de vencimiento de los productos.
				dateToCompare = new Date(),
				limit = 500000,
				allPromises = [],
				promises = [],
				clientes = [],
				group = 0,
				tiempo = null,
				promiseInsert = [];


			db.get('CLIENTE_TEST').count({}, function (err, count) {
				group = count / limit;
				console.log('Count');
				console.log('*****');
				console.log(count);
				console.log('*****');
				console.log('Group');
				console.log('*****');
				console.log(group);
			});

			// Buscar los datos de la configuracion para saber el valor del ajuste de tasa
			db.get('SETTINGS').findOne({
				configId: 1
			}, function (err, obj) {
				settings = obj;
			});
			// Buscar la campana Ajuste de tasa 
			db.get('CAMPANA').findOne({
				campanaId: 1
			}, function (err, obj) {
				campana = obj;
			});

			// Buscar todos los oficiales
			db.get('USUARIO').find({}, function (err, obj) {
				officialList = obj;
			}).success(function () {

				tiempo = new Date();
				console.log('>>>>>>');
				console.log('INICIO');
				console.log(tiempo);
				console.log('>>>>>>');

				dateToCompare.setDate(dateToCompare.getDate() + settings.ajusteTasa.valor);
				dateToCompare.setHours(0, 0, 0, 0);

				MongoClient.connect("mongodb://" + config.DB_URL, function (err, dbm) {


					var resolveClient = function (pLimit, pSkip) {

						var deferred = q.defer();

						dbm.collection('CLIENTE_TEST').aggregate([
							{
								$unwind: '$producto'
							},
							{
								$skip: pSkip
							},
							{
								$limit: pLimit
							},
							{
								$match: {
									'producto.vencimiento': dateToCompare
								}
							},
							{
								$project: {
									clienteId: "$clienteId",
									oficialId: "$oficialId",
									producto: '$producto',
									tipoIdentificacion: '$tipoIdentificacion',
									codigoIdentificacion: '$codigoIdentificacion',
									nombre: '$nombre',
									segmento: '$segmento',
									telefono: '$telefono'
								}
							}
					], {}, function (err, clientes) {

							deferred.resolve(clientes);
						});

						return deferred.promise;
					};

					for (var x = 0; x < group; x++) {
						allPromises.push(resolveClient(limit, (x * limit)));
					}

					q.all(allPromises).then(function (results) {

						tiempo = new Date();
						console.log('>>>>>>');
						console.log('Fin');
						console.log(tiempo);
						console.log('>>>>>>');

						clientes = clientes.concat.apply(clientes, results);

						for (var x in clientes) {
							var clienteCampana = {};
							clienteCampana.oficialId = clientes[x].oficialId;
							clienteCampana.clienteId = clientes[x].clienteId;
							clienteCampana.campanaId = campana.campanaId;
							clienteCampana.productoId = clientes[x].producto.productoId;
							clienteCampana.prioridad = 0;

							clienteCampana.cliente = {
								clienteId: clientes[x].clienteId,
								tipoIdentificacion: clientes[x].tipoIdentificacion,
								codigoIdentificacion: clientes[x].codigoIdentificacion,
								nombreCompleto: clientes[x].nombre,
								segmento: clientes[x].segmento,
								telefono: clientes[x].telefono
							};
							clienteCampana.campana = campana;
							clienteCampana.producto = clientes[x].producto;
							clienteCampana.producto.vencimiento = new Date(clientes[x].producto.vencimiento);
							clienteCampana.producto.vencimiento.setHours(0, 0, 0, 0);
							clienteCampana.oferta = [];
							clienteCampanaList.push(clienteCampana);
						}

					}).then(function () {

						console.log('-');
						console.log('/////////////////////////');
						console.log('Setear el Oficial');
						console.log('-----------------');
						console.log('* clienteCampanaList.length');
						console.log('*' + clienteCampanaList.length);
						console.log('/////////////////////////');
						// Setear el oficial del cliente
						for (var x in clienteCampanaList) {
							for (var y in officialList) {
								if (clienteCampanaList[x].oficialId == officialList[y].usuarioId) {
									clienteCampanaList[x].oficial = {
										usuarioId: officialList[y].usuarioId,
										usuarioRed: officialList[y].usuarioRed,
										oficial: officialList[y].oficial,
										zona: officialList[y].zona,
										sucursal: officialList[y].sucursal
									};
								}
							}
						}
					}).then(function () {

						console.log('-');
						console.log('/////////////////////////////');
						console.log('Insertar en la base de datos:');
						console.log('-----------------------------');
						console.log('* clienteCampanaList.length');
						console.log('* ' + clienteCampanaList.length);

						/*db.get('CLIENTECAMPANA_TEST').insert(clienteCampanaList, {
							w: 1
						}, function (err, records) {
							console.log('Datos insertados correctamente!');
							console.log('* ERROR');
							console.log(err);
							console.log('/////////////////////////////');
						});*/

						/*var insertClients = function () {

							var deferred = q.defer();

							db.get('CLIENTECAMPANA_TEST').insert({}, function (err, resutl) {\
								deferred.resolve(resutl);
							});

							return deferred.promise;
						};

						for (var x = 0; x < group; x++) {
							promiseInsert.push(insertClients());
						}
						
						q.all(promiseInsert).then(function (results) {
							
						});*/




					});

				});

			});

		}, null, true);




	//routes testing
	app.get('/usr/find/:name/:email', users.find(db));

	http.createServer(app).listen(config.APP_PORT,
		function () {
			console.log("\n[*] Server Listening on port %d", config.APP_PORT);
		}
	);
});