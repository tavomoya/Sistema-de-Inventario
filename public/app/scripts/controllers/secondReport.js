'use strict';

/**
 * @ngdoc function
 * @name yeomanApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the yeomanApp
 */
angular.module('yeomanApp')
  .controller('2ndReportCtrl', function ($scope, $rootScope, $modal, $http, wsUtil, wsCrud, $window, dialogs, $modalInstance) {

    console.log('Controlador de Reportes')

    $scope.articulos = [];
    var params = {
        filter: '{ }',
        limit: 20,
        skip: 0,
        sort: 'tipoTransaccion',
        search: '',
        tabla: 'TRANSACCION',
        fields: []
    };

    wsUtil.getPaginatedSearch(params)
	    .then(function (result) {
	        console.log('Transacciones ',result.data)
	        $scope.articulos = angular.copy(result.data);
    })

	$scope.cancel = function(){
		$modalInstance.dismiss('canceled');  
	};

    $scope.gridOptions = { 
        data: 'articulos',
        columnDefs: [
            {field:'tipoTransaccion', displayName:'Tipo de Transaccion'},
            {field:'articulo.Descripcion', displayName:'Articulo'},
            {field:'cantidad', displayName:'Cantidad'},
            {field:'monto', displayName:'Monto'}
        ]
    };

  });