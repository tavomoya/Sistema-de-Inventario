/******************
 * ARCHIVO:
 *  CRM/controllers/gestiones.js
 ******************
 * FUNCIONALIDADES:
 *
 * 1) Activar/Desactivar oficial (funcion: updateOfficial)
 * 2) Buscar Jerarquia (funcion: getUsersHierarchy)
 * 3) Actualizar un manager (funcion: updateManagers)
 *
 *******************
 * DESARROLLADOR PRINCIPAL:
 * Abimael Wilmort
 *
 *******************
 * COLABORADORES:
 * 1)
 *
 *******************
 */

'use strict';

//Transfiere los clientes de un oficial a otro para luego desactivarlo.
exports.updateOfficial = function (db) {

	return function (req, res) {
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/************* Constantes y Variables publicas *************/

		//Arreglo que almacena los clientes del oficial que se va a activar o desactivar
		var clientList = [],
			//Variable que almacena el id del oficial que se va a activar o desactivar
			id = req.body.obj.usuarioId.usuarioId || req.body.obj.usuarioId.usuarioOriginal,
			//Contiene verdadero o falso dependiendo del valor enviado
			active = req.body.obj.activo == true ? true : false;

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/************* Objetos *************/

		//Define que por cual propiedad se hara la busqueda de los clientes, si se envia la propiedad usuarioId, se buscara por esta, 
		//si se envia usuarioOriginal, se buscara por la propiedad 'oficial.usuarioId'
		var propiedad = req.body.obj.usuarioId.usuarioId != undefined ? {
			usuarioId: id
		} : {
			'oficial.usuarioId': id
		};

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/************* Inicializacion o codigo implementado *************/

		db.get('CLIENTECAMPANA').find(propiedad, function (err, obj) {
			clientList = obj;

			for (var i in clientList) {
				//Comprobamos que el cliente no ha sido atendido
				if (clientList[i].estatusVenta != 'Pendiente') {
					db.get('CLIENTECAMPANA').update({
						_id: clientList[i]._id
					}, {
						$set: {
							usuarioId: req.body.obj.usuarioIdTransf
						}
					}, function (err, obj) {
						if (err) {
							throw err;
						}
						res.json({
							result: 'Ok'
						});
					});
				}
			}
			//Activamos o desactivamos al oficial
			db.get('USUARIO').update({
					usuarioId: id
				}, {
					$set: {
						activo: active
					}
				},
				function (err, obj) {
					if (err) {
						throw err;
					}
					res.json({
						result: 'Ok'
					});
				}
			);

		});
	};
};

//Funcion que retorna los usuarios segmentados por su jerarquia
exports.getUsersHierarchy = function (db) {

	return function (req, res) {
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/************* Constantes y Variables publicas *************/

		//Arreglo que almacena la jerarquia de oficiales
		var userList = [];

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/************* Inicializacion o codigo implementado *************/
		
		db.get('USUARIO').find({}, function (err, obj) {

			//Funcion que crea la jerarquia de usuarios
			//Recibe un nodo y una lista, si el id del manager de los oficiales de la lista son es igual al id del nodo (manager) 
			//entonces agrega al nodo un nodo nuevo
			var createNodes = function (nodo, lista) {
				for (var x in lista) {
					if (lista[x].manager != undefined) {
						if (lista[x].manager.usuarioId != null) {
							if (lista[x].manager.usuarioId == nodo.id) {
								nodo.sub.push({
									id: lista[x].usuarioId,
									nombre: lista[x].oficial,
									sub: []
								});
							}
						}
					}
				}
				for (var t in nodo.sub) {
					createNodes(nodo.sub[t], obj);
				}
			};
			
			//Aqui se crean los primeros nodos (Aquellos usuarios que no tienen Manager)
			for (var i in obj) {
				if (obj[i].manager != undefined) {
					if (userList[i] == undefined && obj[i].manager.usuarioId == null) {
						userList.push({
							id: obj[i].usuarioId,
							nombre: obj[i].oficial,
							sub: []
						});
					}
				}
			}
			
			for (var o in userList) {
				createNodes(userList[o], obj);
			}
			res.json(userList);
		});
	};
};
//Funcion que inserta en el manager los oficiales que estan por debajo de el
exports.updateManagers = function (db) {
	return function (req, res) {
		
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/************* Inicializacion o codigo implementado *************/
		
		db.get('USUARIO').update(req.body.id, {
			$set: {
				rol: req.body.tipo,
				manager: req.body.obj
			}
		}, function (err, obj) {
			res.json(err);
		});

		if (req.body.tipo == 'Oficial') {
			//Buscar el manager
			db.get('USUARIO').findOne({
				usuarioId: req.body.obj.usuarioId
			}, function (err, obj) {
				//Saber si tiene el arreglo de oficiales
				if (obj.oficiales != undefined) {
					//Tiene el arreglo de oficiales
					if (obj.oficiales.indexOf(req.body.id.usuarioId) != -1) {
						setRole();
					} else {
						//Insertar el oficial en el arreglo de oficiales
						db.get('USUARIO').update(req.body.obj, {
							$push: {
								oficiales: req.body.id.usuarioId
							}
						}, function (err, obj) {
							res.json(err);
							deleteUserFromManager();
							setRole();
						});
					}
				} else {
					//No tiene el arreglo de oficiales
					//Insertar el oficial en el arreglo de oficiales
					db.get('USUARIO').update(req.body.obj, {
						$push: {
							oficiales: req.body.id.usuarioId
						}
					}, function (err, obj) {
						res.json(err);
						deleteUserFromManager();
						setRole();
					});
				}

			});
			
			//Esta funcion elimina de la lista de oficiales del manager aquellos usuarios que ya no le pertenecen
			var deleteUserFromManager = function () {
				db.get('USUARIO').find({}, function (err, obj) {
					for (var x in obj) {
						if (obj[x].usuarioId != req.body.obj.usuarioId) {
							if (obj[x].oficiales) {
								if (obj[x].oficiales.indexOf(req.body.id.usuarioId) != -1) {
									var index = obj[x].oficiales.indexOf(req.body.id.usuarioId);
									db.get('USUARIO').update({
										usuarioId: obj[x].usuarioId
									}, {
										$pull: {
											oficiales: req.body.id.usuarioId
										}
									});
								}
							}
						}
					}
				});
			};
			
			//Esta funcion actualiza el rol del usuario. Si no tiene manager es un Administrador, de lo contrario es un Oficial.
			var setRole = function () {
				db.get('USUARIO').find({}, function (err, obj) {
					for (var x in obj) {
						if (obj[x].oficiales) {
							if (obj[x].oficiales.length > 0) {
								db.get('USUARIO').update({
									usuarioId: obj[x].usuarioId
								}, {
									$set: {
										rol: 'Administrador'
									}
								});
							} else {
								db.get('USUARIO').update({
									usuarioId: obj[x].usuarioId
								}, {
									$set: {
										rol: 'Oficial'
									}
								});
							}
						}
					}
				});
			};

		}
	};
};