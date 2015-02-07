var util = require('util'),
	jLinq = require('jlinq'),
	md5 = require('MD5');


exports.buscarPorId = function (db) {
	return function (req, res) {
		db.get(req.body.tabla).findOne(req.body.query, function (err, obj) {
			res.json(obj);
		})
	}
}

exports.new = function (db) {
	return function (req, res) {
		// Insertar parametros de fecha
		if (req.body.obj.dateParams) {
			var dateParams = req.body.obj.dateParams;
			for (var i in dateParams) {
				var nombreCampo = dateParams[i].nombreCampo;
				var stringDate = dateParams[i].stringDate;
				req.body.obj[nombreCampo] = new Date(stringDate);
			}
			delete req.body.obj.dateParams;
		}
		db.get(req.body.tabla).insert(req.body.obj, function (err, obj) {
			if (err) throw err;
			var response = (req.body.obj[0]) ? {
				result: "Ok",
				file: req.body.obj[0].file
			} : {
				result: "Ok",
				obj: obj
			}
			res.json(response);
		});
	}
}

exports.delete = function (db) {
	return function (req, res) {
		db.get(req.body.tabla).remove(req.body.obj, function (err, obj) {
			if (obj) {
				res.json({
					result: "Ok"
				});
			}
			if (err) {
				res.json({
					err: err
				});
			}
		});
	}
}

exports.update = function (db) {
	return function (req, res) {
		if (req.body.obj.dateParams) {
			var dateParams = req.body.obj.dateParams;
			for (var i in dateParams) {
				var nombreCampo = dateParams[i].nombreCampo;
				var stringDate = dateParams[i].stringDate;
				req.body.obj[nombreCampo] = new Date(stringDate);
			}
			delete req.body.obj.dateParams;
		}
		db.get(req.body.tabla).update(req.body.query, {
			$set: req.body.obj
		}, function (err, obj) {
			if (err) throw err;
			res.json({
				result: "Ok"
			});
		})
	}
}

exports.upsert = function (db) {
	return function (req, res) {
		if (req.body.tabla == "USUARIO")
			req.body.obj.password = md5(req.body.obj.usuarioRed)
		db.get(req.body.tabla).update(req.body.query, req.body.obj, {
			upsert: true
		}, function (err, obj) {
			if (err) {
				throw err;
			} else {
				res.json(obj);
			}
		});
	}
}

exports.search = function (db) {
	return function (req, res) {
		for (var prop in req.body.obj) {
			try {
				req.body.obj[prop] = JSON.parse(req.body.obj[prop]);
			} catch (err) {

			}
			if (prop == 'dateRange') {
				var operation = req.body.obj[prop].operation;
				req.body.obj[req.body.obj[prop].field] = {};
				req.body.obj[req.body.obj[prop].field][operation] = new Date(req.body.obj[prop].fecha);
				delete req.body.obj[prop];
			}
		}
		db.get(req.body.tabla).find(req.body.obj, function (err, obj) {
			console.log(req.body.obj);
			res.json(obj);
		})
	}
}

exports.count = function (db) {
	return function (req, res) {
		db.get(req.body.tabla).count(JSON.parse(req.body.obj), function (err, obj) {
			res.json(obj);
		})
	}
}

exports.paginatedSearch = function (db) {
	return function (req, res) {
		console.log("*** PAGINATED SEARCH ***",req.body.filter);
		var where = JSON.parse(req.body.filter) || {};
		var search = req.body.search;
		var fields = req.body.fields;
		var dateRange = req.body.dateRange;


		//Login Credentials
		var CredentialsTemp = getCredentialsFilter(req);
		if (CredentialsTemp != undefined &&   JSON.stringify(CredentialsTemp) != '{}')
		{
			where['oficial.usuarioId']  = CredentialsTemp;

			console.log('*** USUARIO ID -1 ***');
			console.log(where['oficial.oficialId'],JSON.stringify(CredentialsTemp));
		}
		else
		if (req.body.user != undefined)
		{
			if (req.body.user.rol == "Administrador") {
				where['oficial.usuarioId'] = {
					$in: req.body.user.oficiales || []
				}
				where['oficial.usuarioId'].$in.push(req.body.user.usuarioId);
			} else {
				// where.oficial = {oficialId: req.body.user.usuarioId}
				where['oficial.usuarioId'] = req.body.user.usuarioId;
			}

			console.log('*** USUARIO ID -2 ***');
			console.log(where['oficial.usuarioId']);
			
		}
		//Pagination Limits
		var pagination = {
			limit: req.body.limit,
			skip: req.body.skip,
			sort: req.body.sort
		}
		console.log("** PAGINATION **");
		console.log(JSON.stringify(pagination));

		// Filtro por multiples campos

		if (fields.length > 0 && search) {
			where.$or = [];
			fields.forEach(function (field) {
				var obj = {};
				// MEJORAR LA BUSQUEDA
				obj[field] = {
					$regex: search,
					$options: 'i'
				}

				where.$or.push(obj);
				console.log(obj);
			});
		}

		// Filtro por multiples campos para fecha
		if (dateRange != undefined && dateRange != "") {
			where.$and = [];
			var fieldsRange = dateRange.fields;
			var fechaInicio = dateRange.start.toString().split('-');
			var fechaFin = dateRange.end.toString().split('-');
			var objectStart = {
				dia: fechaInicio[2].substring(0, 2),
				mes: fechaInicio[1],
				ano: fechaInicio[0]
			};
			var objectEnd = {
				dia: fechaFin[2].substring(0, 2),
				mes: fechaFin[1],
				ano: fechaFin[0]
			};
			fieldsRange.forEach(function (field) {
				var obj = {};
				obj[field] = {
					$gte: new Date(objectStart.ano, objectStart.mes - 1, objectStart.dia, 0, 0, 0),
					$lte: new Date(objectEnd.ano, objectEnd.mes - 1, objectEnd.dia, 23, 59, 59)
				};
				where.$and.push(obj);
			})
		}

		console.log("** Body **");
		console.log(req.body);

		console.log("** Where **");
		console.log(JSON.stringify(where));

		console.log(req.body.tabla)
		db.get(req.body.tabla).find(where, pagination,
			function (err, campanas) {
				if (err) throw err;
				//console.log(campanas);
				res.json(campanas);
			});
	}
}

function getCredentialsFilter(req) {
	var where = {};

	if (!req.user) return where;

	if (req.user.rol == "Administrador") {
		where.$in = req.user.oficiales || []
		where.$in.push(req.user.usuarioId);
		return where;
	} else {
		return req.user.usuarioId;
	}
}