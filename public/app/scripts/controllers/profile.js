'use strict';

/**
 * @ngdoc function
 * @name yeomanApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the yeomanApp
 */
angular.module('yeomanApp')
  .controller('ProfileCtrl', function ($scope, $rootScope, $location) {

  	$scope.imPressed = false;

  	var myTweetsCRUD = new $rootScope.objectCRUD('MENSAJE');
  	$scope.myTweets = [];
  	if ($rootScope.myName == undefined) {
  		$scope.usuario = $rootScope.nombre;
  	} else {
  		$scope.usuario = $rootScope.myName;
  	}

  	if ($scope.usuario == undefined) {
  		$location.path('/#')
  	};

  	var query = {
        tabla: 'MENSAJE',
        obj: {
            author: $scope.usuario
        }
    };
    console.log(query[0]);
    //console.log($scope.author)
    myTweetsCRUD.getByParams(query, function(myTweets){
    	$scope.myTweets = myTweets;

    });

    $scope.changePassword = function(){

    	$scope.imPressed = true;
    	console.log("estoy aqui")
    	console.log($scope.imPressed);

		$scope.submitChange = function(){
	    	var query = {
	        tabla: 'USERS',
	        obj: {
	            username: $scope.usuario
	            }
	        };

	        var passwordCRUD = new $rootScope.objectCRUD('USERS');
	        passwordCRUD.getByParams(query, function(data){

	            console.log(data[0].username);
	            console.log($scope.usuario);

	            if ($scope.oldPassword == data[0].password && $scope.newPassword == $scope.reNew) {

	            	passwordCRUD.update(data[0], {password: $scope.newPassword}, function(){

	            		alert("Ur password has been saved! :)");
	            		$location.path('/profile');
	            	});

	            };
	        });

    	};

    }


  });