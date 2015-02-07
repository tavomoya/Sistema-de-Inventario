'use strict';

var app = angular.module('symdevsApp');

app.factory('wsOportunity', function ($http) {

	var ws = {
		// Paginated Search
		searchOportunities: function (officialId) {
			
			var query = {
				'creadoPor': officialId,
				'etapa.ProbabilidadCierre': '{ "$ne": 100}'
			};
			
			var promise = $http.post('/mantenimiento/search', {
				tabla: 'OPORTUNIDAD',
				obj: query
			}).success(function (data, status, headers, config) {
				return data;
			}).error(function (data, status) {
				return data;
			});

			return promise;
		}
	}
	return ws;
});