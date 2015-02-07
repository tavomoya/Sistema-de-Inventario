'use strict';

var app = angular.module('symdevsApp');

app.factory('wsRequest', function ($http) {
	
	var ws = {
		// Paginated Search
		searchRequests: function (officialId, status) {
			var query = {
				'creadoPor': officialId,
				'estatus': status
			};

			var promise = $http.post('/mantenimiento/search', {
				tabla: 'SOLICITUD',
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