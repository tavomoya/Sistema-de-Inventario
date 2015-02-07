'use strict';

/**
 * @ngdoc function
 * @name yeomanApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the yeomanApp
 */
angular.module('yeomanApp')
  .controller('MainCtrl', ['$scope', '$rootScope', '$interval', '$location',
   function ($scope, $rootScope, $interval, $location) {

    var mensajeCRUD = new $rootScope.objectCRUD('MENSAJE');
    $scope.tweets = [];
    $scope.author = angular.copy($rootScope.nombre);

    //Funcion que actualiza mi twitter cada 3 segundos
    var refresh = $interval(function(){
         mensajeCRUD.get(function(tweets){
        $scope.tweets = tweets;
    });

    }, 1000);

    //Funcion de agregar un nuevo tweet al feed
    $scope.addTweet = function() {

    	var fecha = new Date();
	    var dia = fecha.toLocaleDateString();
	    //var hour = fecha.toLocaleTimeString();

        var hour = fecha.getHours();
        var min = fecha.getMinutes();
        var sec = fecha.getSeconds();
    	console.log("estoy aqui");
    	var tweet = {author: $scope.author, message: $scope.tweet, date: dia+' '+fix(hour)+':'+fix(min)+':'+fix(sec)};
        $scope.tweets.push(tweet);
        mensajeCRUD.insert(tweet, function(data){
            alert("ur tweet has been posted :)");
            $scope.tweet = "";

        });
    	
    };

    var fix = function(str){
    return str < 10? "0" + str : str;
    }

    //Funcion de eliminar un tweet del feed
    $scope.removeTweet = function(id) { 

    	//$scope.tweets.splice($scope.tweets.length - index - 1, 1);

        var query = {
            tabla: 'MENSAJE',
            obj: {
                _id: id
            }
        };

        mensajeCRUD.getByParams(query, function(datos){

            console.log(datos[0].author);
            console.log($scope.author);
            if(datos[0].author == $scope.author){ 

            mensajeCRUD.delete(datos[0], function(status){
                alert("Ur message has been deleted :)");
            });

        } else {
            alert("U cant delete a tweet thats not yours -_-");
        }

        });
    };

    console.log(sessionStorage.length);

    //Funcion que me permite ir al perfil del usuario seleccionado
    $scope.viewProfile = function(autor) {
        clearInterval(refresh);
        $rootScope.myName = autor;
        $location.path('/profile');
    }

  }]);
