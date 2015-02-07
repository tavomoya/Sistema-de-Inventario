// Controlador para ClienteCampana

exports.guardarOportunidad = function (db) {
	return function (req, res) {
		// Insertar OPORTUNIDAD, luego Actualizar ClienteCampana
		if (req.body.obj.dateParams) {
			var dateParams = req.body.obj.dateParams;
			for (var i in dateParams) {
				var nombreCampo = dateParams[i].nombreCampo;
				var stringDate = dateParams[i].stringDate;
				req.body.obj[nombreCampo] = new Date(stringDate);
			}
			delete req.body.obj.dateParams;
		}
		var oportunidad = req.body.obj;
		db.get("OPORTUNIDAD").insert(oportunidad)
		.on('complete', function (err, doc){
			var query = {
				clienteId : req.body.clienteId,
				campanaId : req.body.campanaId
			}
			var miniOportunidad = {
				_id: doc._id,
				descripcion: doc.descripcion,
				tipo: doc.tipo
			}
			var obj = { $addToSet: { "oportunidades" : miniOportunidad } };
			return db.get("CLIENTECAMPANA").update(query, obj)
		})
		.then(function (err, doc) {
			res.json({ result : "Ok", generated : "Oportunidad" });
		})
	}
}

exports.guardarActividad = function (db) {
	return function (req, res) {
		// Insertar ACTIVIDAD, luego Actualizar ClienteCampana
		if (req.body.obj.dateParams) {
			var dateParams = req.body.obj.dateParams;
			for (var i in dateParams) {
				var nombreCampo = dateParams[i].nombreCampo;
				var stringDate = dateParams[i].stringDate;
				req.body.obj[nombreCampo] = new Date(stringDate);
			}
			delete req.body.obj.dateParams;
		}
		var actividad = req.body.obj;
		db.get("ACTIVIDAD").insert(actividad)
		.on('complete', function (err, doc){
			var query = {
				clienteId : req.body.clienteId,
				campanaId : req.body.campanaId
			}
			var miniActividad = {
				_id: doc._id,
				descripcion: doc.descripcion,
				tipo: doc.tipo
			}
			var obj = { $addToSet: { "actividades" : miniActividad } };
			return db.get("CLIENTECAMPANA").update(query, obj)
		})
		.then(function (err, doc) {
			console.log('HEREEEE DOC', doc)
			res.json({ result : "Ok", generated : "Actividad" });
		})
	}
}