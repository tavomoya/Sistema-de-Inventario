'use strict';

/**
 * @ngdoc function
 * @name yeomanApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the yeomanApp
 */
angular.module('yeomanApp')
  .controller('NavCtrl', function ($scope, $window, $location, $rootScope) {


  	$scope.currentTitle = '';
	$scope.oficialesLinks = [];
	$scope.settingsLinks = [];

	// $scope.showOficiales = false;
	// $scope.showSettings = false;

	$scope.linkString = [];

	$scope.navLinks = [
		{
			Title: 'Dashboard',
			LinkText: '/#'
   		},
		{
			Title: 'Articulos',
			LinkText: '#/articulos'
		},
		{
			Title: 'Almacenes',
			LinkText: '#/almacen'
		},
		{
			Title: 'Tipo de Inventario',
			LinkText: '#/tipoInventario'
		},
		// {
		// 	Title: 'Existencia x Almacen',
		// 	LinkText: '#/existenciaAlmacen'
		// },
		{
			Title: 'Transacciones',
			LinkText: '#/transacciones'
		}, 
		{
			Title: 'Consultas',
			LinkText: '#/consultas'
		},
		{
			Title: 'Reportes',
			LinkText: '#/reportes'
		}
	];

	$scope.selectCurrentNav = function (title) {
		$scope.currentTitle = title;
	};
	
	$scope.navClass = function (title) {
		return title == $scope.currentTitle ? 'active' : '';
	};

	$scope.logout = function () {
    	console.log('funcion de logout')
    	// $rootScope.logged = false;
    	delete $window.sessionStorage.userData;
    	delete $window.sessionStorage.token;
    	delete $window.sessionStorage.logged;
    	$rootScope.logged = false;
    	console.log($rootScope.isAuthenticated)
    	$location.path('/login');
    }

    if ($window.sessionStorage.logged || $window.sessionStorage.logged == "true") {
    	var user = {};
    	// console.log(JSON$window.sessionStorage.userData)
    	user = JSON.parse($window.sessionStorage.userData);
    	console.log('the user', user)
    	if (user.role.id === 2) {
    		console.log('lalalal')
    		$scope.navLinks.splice(3, 4);
    	};
    };


  });