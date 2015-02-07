'use strict';

var app = angular.module('symdevsApp');

app.factory('wsCampaign', function ($http) {
	
	var service = {

		getCampaigns: function (officialId) {

			var params = {
					query: {
						'oficialId': officialId
					}
				},
				
				promise = $http.post('/campana/getPendingProspects', params).success(function (data, status, headers, config) {
					return data;
				}).error(function (data, status) {
					return data;
				});

			return promise;
		}
	};
	return service;
});