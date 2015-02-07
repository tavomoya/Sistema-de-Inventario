'use strict';

var app = angular.module('symdevsApp');

app.factory('wsActivity', function ($http) {

	var ws = {
		// Paginated Search
		searchActivities: function (officialId, status) {
			var date = new Date();
			date.setHours(23, 59, 59, 999);

			var query = {
				'creadoPor': officialId,
				'estatus': status,
				'dateRange': {
					'field': 'fechaInicio',
					fecha: date,
					operation: '$lte'
				}
			};

			var promise = $http.post('/mantenimiento/search', {
				tabla: 'ACTIVIDAD',
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