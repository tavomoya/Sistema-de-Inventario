'use strict';

/**
 * @ngdoc function
 * @name yeomanApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the yeomanApp
 */
angular.module('yeomanApp')
  .controller('1stReportCtrl', function ($scope, $rootScope, $modal, $http, wsUtil, wsCrud, $window, dialogs, $modalInstance) {

    console.log('Controlador de Reportes')

    $scope.articulos = [];
    var params = {
        filter: '{"existencia": {"$lte": '+100+'} }',
        limit: 20,
        skip: 0,
        sort: 'Descripcion',
        search: '',
        tabla: 'ARTICULO',
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
            {field:'Descripcion', displayName:'Nombre'},
            {field:'existencia', displayName:'Existencia'},
            {field:'tipoInventario.Descripcion', displayName:'Tipo de Inventario'},
            {field:'estado', displayName:'Estado'}
        ]
    };

  });