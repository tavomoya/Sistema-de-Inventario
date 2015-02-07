'use strict';

var app = angular.module('symdevsApp');

app.factory('wsClienteCampana', function ($http) {
		
	var ws = {
		// GuardarOportunidad
		guardarOportunidad: function (params) {
            var objData = {
            	clienteId : params.clienteId,
            	campanaId : params.campanaId,
            	obj : params.obj
			}
            var promise = $http.post('/api/clientecampana/guardarOportunidad', objData)
            .success(function (data, status, headers, config) {
                return data;
            })
            .error(function (data, status) {
				return data;
			});
            
            return promise;
        },
        // GuardarActividad
		guardarActividad: function (params) {
            var objData = {
            	clienteId : params.clienteId,
            	campanaId : params.campanaId,
            	obj : params.obj
			}
            var promise = $http.post('/api/clientecampana/guardarActividad', objData)
            .success(function (data, status, headers, config) {
                return data;
            })
            .error(function (data, status) {
				return data;
			});
            
            return promise;
        },
    }

    return ws;
});