'use strict';

/**
 * @ngdoc function
 * @name yeomanApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the yeomanApp
 */
angular.module('yeomanApp')
  .controller('3rdReportCtrl', function ($scope, $rootScope, $modal, $http, wsUtil, wsCrud, $window, dialogs, $modalInstance) {

    console.log('Controlador de Reportes')

    $scope.articulos = [];
    var params = {
        filter: '{ }',
        limit: 20,
        skip: 0,
        sort: 'articulo.Descripcion',
        search: '',
        tabla: 'EXISTENCIA_ALMACEN',
        fields: []
    };

    wsUtil.getPaginatedSearch(params)
	    .then(function (result) {
	        console.log('Articulos',result.data)
	        $scope.articulos = angular.copy(result.data);
    })

	$scope.cancel = function(){
		$modalInstance.dismiss('canceled');  
	};

    $scope.gridOptions = { 
        data: 'articulos',
        columnDefs: [
            {field:'articulo.Descripcion', displayName:'Nombre del Articulo'},
            {field:'cantidad', displayName:'Existencia'},
            {field:'almacen.Descripcion', displayName:'Almacen'}
        ]
    };

  });