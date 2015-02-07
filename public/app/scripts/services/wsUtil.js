'use strict';

var app = angular.module('yeomanApp');

app.factory('wsUtil', function ($http) {
		
	var ws = {
		// Paginated Search
		getPaginatedSearch: function (params) {
            var objData = {
				filter: params.filter,
				limit: params.limit,
				skip: params.skip,
				sort: params.sort,
				search: params.search,
				user: params.user,
				tabla: params.tabla,
				fields: params.fields,
				dateRange: params.dateRange
			}
            var promise = $http.post('/mantenimiento/paginatedSearch', objData)
            .success(function (data, status, headers, config) {
                return data;
            })
            .error(function (data, status) {
				return data;
			});
            
            return promise;
        },
		// Listas 
		getListas : function (listas) {
			var objData = {
				listas: listas
			}
			var promise = $http({ method: 'POST', url: '/util/listas', data: objData })
			.success(function (data, status) {
				return data;
			})
			.error(function (data, status) {
				return data;
			});

			return promise;
		},
	   // Secuencia
	   getSecuencia : function (idSecuencia) {
	   	var objData = {
				idSecuencia: idSecuencia
			}
	    var promise = $http({ method: 'POST', url: '/util/secuencia', data: objData })
				.success(function (data, status) {
					return data;
				})
				.error(function (data, status) {
					return data;
				});

				return promise;
	   }
	}

	return ws;
});