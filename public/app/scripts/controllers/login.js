'use strict';

/**
 * @ngdoc function
 * @name yeomanApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the yeomanApp
 */
angular.module('yeomanApp')
  .controller('LoginCtrl', function ($scope, $rootScope, $location, wsCrud, $window, $http) {


  	// $scope.$apply();
  	$window.sessionStorage.logged = false;
  	var userCrud = wsCrud.getInstance('USUARIO');
  	$rootScope.userData = {};
	// var usuariosCRUD = new $rootScope.objectCRUD('USUARIO');
	$scope.users = {
		email: '',
		password: ''
	};

	console.log('lalalalala', $window.sessionStorage.logged);

  	$scope.logIn = function(){


  		$scope.users.email = $scope.username;
  		$scope.users.password = $scope.password;
  		console.log('el user--->', $scope.users)
  		$http.post('/login', $scope.users)
  			.success(function (data, status, headers, config){
  				console.log('Funcione en el login', data)
  				$window.sessionStorage.token = data.token;
  				$rootScope.userData = data.user;
  				console.log('user Data', $rootScope.userData)
  				$window.sessionStorage.userData = JSON.stringify(data.user);
  				$window.sessionStorage.logged = true;
  				$rootScope.logged = $window.sessionStorage.logged;
  				// alert("Welcome back "+$window.sessionStorage.user.+" :D");
  				$location.path('/almacen');

  			})	
 
    };

  });