'use strict';

/**
 * @ngdoc function
 * @name yeomanApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the yeomanApp
 */
angular.module('yeomanApp')
  .controller('ConsultasCtrl', function ($scope, $rootScope, $http, wsUtil, wsCrud, $window, articulo, tipoInv, almacen, existencia, dialogs) {

    console.log('lala', $window.sessionStorage.logged)
    $rootScope.logged = $window.sessionStorage.logged;
    $scope.articulos = articulo.data;
    $scope.almacenes = almacen.data;
    $scope.existencias = existencia.data;
    $scope.inventarios = tipoInv.data;

    console.log('la data que traje', articulo.data, $scope.almacenes, $scope.existencias)

    $scope.selectCriteria = function (criterio) {
        console.log('el criterio', criterio)

        if (criterio == 'articulo') {
            $scope.isArticulo = true;
            $scope.isAlmacen = false;
            $scope.isExistencia = false;
        } else if (criterio == 'almacen') {
            $scope.isAlmacen = true;
            $scope.isArticulo = false;
            $scope.isExistencia = false;
        } else {
            $scope.isExistencia = true;
            $scope.isArticulo = false;
            $scope.isAlmacen = false;
        }
    };

    $scope.selectedInv = function(inventario) {
        console.log('el inventario', inventario)
        var articuloCrud = wsCrud.getInstance('ARTICULO');
        var query = {"tipoInventario.Descripcion": inventario};

        articuloCrud.getByParams(query)
            .success(function(data, status){
                console.log('Funcione y esto es todo', data, status);
                if (data.length == 0) {
                    dialogs.notify();
                }else {
                    $scope.articulos = data;
                }
            }).error(function(error, status){
                console.log('No funciono nada')
            });
    };

    $scope.selectEstado = function (estado) {
        console.log('el estado', estado)
        var almacenCrud = wsCrud.getInstance('ALMACEN');
        var query = {"estado": estado};

        almacenCrud.getByParams(query)
            .success(function(data, status){
                console.log('Funcione y esto es todo', data, status);
                if (data.length == 0) {
                    dialogs.notify();
                }else {
                    $scope.almacenes = data;
                }
            }).error(function(error, status){
                console.log('No funciono nada')
            });
    };


    $scope.selectedArt = function(articulo) {
        console.log('el articulo', articulo);
        var existenciaCrud = wsCrud.getInstance('EXISTENCIA_ALMACEN');
        var query = {"articulo.Descripcion": articulo};

        existenciaCrud.getByParams(query)
            .success(function(data, status){
                console.log('it worked', data);
                if (data.length == 0) {
                    dialogs.notify();
                }else {
                    $scope.existencias = data;
                }

            })
    }

  });