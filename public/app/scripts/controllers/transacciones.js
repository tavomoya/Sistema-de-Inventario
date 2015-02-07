'use strict';

/**
 * @ngdoc function
 * @name yeomanApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the yeomanApp
 */
angular.module('yeomanApp')
  .controller('TransaccionesCtrl', function ($scope, $rootScope, $modal, $http, wsUtil, wsCrud, articulo, $window, almacen, dialogs) {

    console.log('lala', $window.sessionStorage.logged)
    $rootScope.logged = $window.sessionStorage.logged;
    $scope.listaTransacciones = [];
    $scope.hayCambios = false;
    $scope.filtrarPor = "";
    $scope.reverse = false;
    $scope.articulos = articulo.data;
    $scope.almacenes = almacen.data;
    var dialog = null;
    var transaccionCRUD = wsCrud.getInstance('TRANSACCION')
    var articuloCrud = wsCrud.getInstance('ARTICULO');
    var almacenCrud = wsCrud.getInstance('ALMACEN');
    $scope.edicion = {
        edicion: false,
        nuevo: false
    };
    console.log($scope.articulos);

   //Objeto que funciona como parametro de busqueda en la base de datos 
   var params = {
        filter: '{ }',
        limit: 40, 
        skip: 0,
        sort: 'tipoTransaccion',
        search: '',
        tabla: "TRANSACCION",
        fields: '' 
   }

    //Funcion que me agrega un nuevo producto en la lista
    $scope.addTransaccion = function () {
        //Objeto con la nueva etapa a insertar
        var existence = {};
        console.log('Prueba de que se guarda todo en los scope', $scope.transaccion);

        transaccionCRUD.insert($scope.transaccion)
            .success(function(data, status){
                console.log('Inserte esto!! ', data.obj);

                if (data.obj.tipoTransaccion == "Entrada") {
                    data.obj.articulo.existencia += data.obj.cantidad;
                    // existence.almacen = data.obj.almacen;
                    // existence.articulo = data.obj.articulo;
                    // existence.cantidad = data.obj.cantidad;
                    articuloCrud.update(data.obj.articulo._id, data.obj.articulo).success(function (data, status) {
                        console.log('Funciono todo ', data, status);
                        dialog = dialogs.notify('Perfecto!', 'Transaccion realizada exitosamente');

                    })
                } else if (data.obj.tipoTransaccion == "Salida") {
                   data.obj.articulo.existencia -= data.obj.cantidad;
                    articuloCrud.update(data.obj.articulo._id, data.obj.articulo).success(function (data, status) {
                        console.log('Funciono todo ', data, status);
                        dialog = dialogs.notify('Perfecto!', 'Transaccion realizada exitosamente')

                    }); 
                }
                //  else if (data.obj.tipoTransaccion == "Traslado") {
                //     data.obj.articulo.almacen = data.obj.almacenDestino;
                //     articuloCrud.update(data.obj.articulo._id, data.obj.articulo).success(function (data, status) {
                //         console.log('Funciono todo ', data, status);
                //         dialog = dialogs.notify('Perfecto!', 'Transaccion realizada exitosamente')

                //     });
                // };

                $history.back();

        });

    };

    $scope.$watch('transaccion.cantidad', function () {
        $scope.transaccion.monto = $scope.transaccion.articulo.costo * $scope.transaccion.cantidad;
        console.log('El monto calculado --> ',$scope.transaccion.monto)
    }, true);

  });