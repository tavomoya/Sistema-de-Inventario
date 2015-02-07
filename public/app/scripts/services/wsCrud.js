'use strict';

var app = angular.module('yeomanApp');

app.factory('wsCrud', function ($http) {

	var service = function () {};

	// Nombre de la tabla
	service.prototype.tabla = '';

	service.prototype.get = function () {
		var promise = $http.post('/mantenimiento/search', {
			tabla: this.tabla,
			obj: {}
		})
		.success(function (data, status) {
			return data;
		})
		.error(function (data, status) {
			return data;
		});

		return promise;
	};
	
	service.prototype.getOne = function (query) {
		var promise = $http.post('/mantenimiento/buscarPorId', {
			tabla: this.tabla,
			query: query
		}).success(function (data, status) {
			return data;
		}).error(function (data, status) {
			return data;
		});

		return promise;
	};

	service.prototype.insert = function (object) {
		console.log("hola")
		var promise = $http.post('/mantenimiento/new', {
			tabla: this.tabla,
			obj: object
		})
		.success(function (data, status) {
			return data;
		})
		.error(function (data, status) {
			return data;
		});

		return promise;
	};

	service.prototype.update = function (query, object) {
		var promise = $http.post('/mantenimiento/update', {
			tabla: this.tabla,
			query: query,
			obj: object
		})
		.success(function (data, status) {
			return data;
		})
		.error(function (data, status) {
			return data;
		});

		return promise;
	};

	service.prototype.upsert = function (query, object) {
		var promise = $http.post('/mantenimiento/upsert', {
			tabla: this.tabla,
			query: query,
			obj: object
		})
		.success(function (data, status) {
			return data;
		})
		.error(function (data, status) {
			return data;
		});

		return promise;
	};

	service.prototype.delete = function (object) {
		var promise = $http.post('/mantenimiento/delete', {
			tabla: this.tabla,
			obj: object
		})
		.success(function (data, status) {
			return data;
		})
		.error(function (data, status) {
			return data;
		});

		return promise;
	};

	service.prototype.getByParams = function (params) {
		var promise = $http.post('/mantenimiento/search', {
			tabla: this.tabla,
			obj: params
		})
		.success(function (data, status) {
			return data;
		})
		.error(function (data, status) {
			return data;
		});

		return promise;
	};

	service.prototype.count = function (filter) {
		var promise = $http.post('/mantenimiento/count', {
			tabla: this.tabla,
			obj: filter
		})
		.success(function (data, status) {
			return data;
		}).error(function (data, status) {
			return data;
		});

		return promise;
	};

	service.prototype.test  = function () {
		console.log(this.tabla);
	};

	var ws = {
        getInstance : function (tabla) {
        	var crud = new service()
        	crud.tabla = tabla;
        	return crud;
        }
    }

	return ws;
});