'use strict';

/**
 * @ngdoc function
 * @name yeomanApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the yeomanApp
 */
angular.module('yeomanApp')
  .controller('ExistenciaAlmacenCtrl', function ($scope, $rootScope, $modal, $http, wsUtil, wsCrud, almacen, articulo) {

  	$scope.listaExistencias = [];
    $scope.hayCambios = false;
    $scope.filtrarPor = "";
    $scope.reverse = false;
    $scope.almacenes = almacen.data;
    $scope.articulos = articulo.data;
    var existenciasCRUD = wsCrud.getInstance('EXISTENCIA_ALMACEN');
    $scope.edicion = {
        edicion: false,
        nuevo: false
    };
    console.log($scope.almacenes);
    // var Productos = function(){ 
    //     return {
    //         "saved": false,
    //         "edited": true
    //     }
    // }
	
   //Objeto que funciona como parametro de busqueda en la base de datos 
   var params = {
        filter: '{ }',
        limit: 40, 
        skip: 0,
        sort: 'cantidad',
        search: '',
        tabla: "EXISTENCIA_ALMACEN",
        fields: '' 
   }

   //Metodo de Busqueda en la base de datos
   wsUtil.getPaginatedSearch(params)
    .success(function (data, status, header, config) {      
            $scope.listaExistencias = data;//Guardar en una variable local
            console.log($scope.listaExistencias);
            for(var i in data) {
                $scope.listaExistencias[i] = data[i];
                $scope.listaExistencias[i].saved = true;
                $scope.listaExistencias[i].edited = false;
            }
    });

    //Funcion que me agrega un nuevo producto en la lista
    $scope.addExistencia = function () {
        //Objeto con la nueva etapa a insertar
        $scope.newExistenciaAlmacen = {
            almacen: $scope.newAlmacen,
            articulo: $scope.newArticulo,
            cantidad: $scope.newCantidad,
            saved: true,
            edited: false
        };

        //Utilizo esta copia para poder borrar los estados de guardado o editado
        //Ya que no me interesa guardarlos en la base de datos
        var copiaExistencia = angular.copy($scope.newExistenciaAlmacen);
        //Borro los campos de la base de datos
        delete copiaExistencia.saved;
        delete copiaExistencia.edited;

        $scope.listaExistencias.push($scope.newExistenciaAlmacen);

        existenciasCRUD.insert(copiaExistencia)
            .success(function(){
                 $rootScope.showMessage(1, $scope.mensaje.agregar, 3500);
                 console.log('lo que me quedo', $scope.listaExistencias);
                 // $scope.$apply();
            });

        $scope.newCantidad = "";
        $scope.newArticulo = "";
        $scope.newAlmacen = "";

    }

    $scope.actualizarExistencia = function(item){

        var index = $scope.listaExistencias.indexOf(item);

        //Objeto que utilizare como parametro de busqueda
        var params = {
            query: { _id: $scope.existenciaTemporal._id },
            obj: $scope.listaExistencias[index],
        };

        console.log(params.query);
        existenciasCRUD.getByParams(params.query)
            .success(function (data, status) { 
            console.log(data)

                var id = $scope.listaExistencias[$scope.listaExistencias.length - 1]._id;
                if (typeof data == "object" && $scope.validarId(id) && !$scope.listaExistencias[index].saved) {
                $scope.showMessage(0, "Este producto ya existe.", 3000);
                return;
                }

                delete $scope.listaExistencias[index].saved;
                delete $scope.listaExistencias[index].edited;
                var existencia_almacen = angular.copy($scope.listaExistencias[index]);
                existenciasCRUD.update(params.query, existencia_almacen)
                    .success(function (data, status, header, config){
                        $rootScope.showMessage(1, $scope.mensaje.actualizar, 3500);
                        $scope.listaExistencias[index].saved = true;
                        $scope.listaExistencias[index].edited = false;                
                        if($scope.edicion.nuevo)
                            $scope.edicion.nuevo = false;
                        else
                            $scope.edicion.edicion = false;
                        $scope.checkCambios();

                    });
            });

    }

    //Funcion que se utiliza para cancelar una actualizacion
    $scope.cancelUpdate = function(existencia_almacen){
        if($scope.edicion.edicion) {
            $scope.edicion.edicion = false;
            existencia_almacen.edited = false;    
        }
    }

    //Funcion que se utiliza para eliminar un ciclo
    $scope.borrarExistencia = function(item){
    	console.log("Entre al borrador")
        var index = $scope.listaExistencias.indexOf(item);
        //Objeto que utilizare como parametro para eliminar
        console.log("Este es el que se va a borrar", $scope.listaExistencias[index]);
        // return;
        var params = {
            tabla: 'EXISTENCIA_ALMACEN',
            obj: { _id: $scope.listaExistencias[index]._id }
        };

        if(!$scope.listaExistencias[index].saved) {
            $scope.listaExistencias.splice(index, 1);
            $scope.checkCambios();
            return;
        }

        existenciasCRUD.getByParams(params.obj).success(function(data, status, headers, config){
            console.log('esta es la data que traigo con ese query', data[0]);
            $rootScope.showModal("Eliminar Tipo de Inventario", "Seguro que desea eliminar este Tipo de Inventario?", function () {
                console.log("Estoy borrando", data[0]._id)
                existenciasCRUD.delete(data[0])
                    .success(function(data,status,headers,config){
                        console.log('borre')
                        $scope.listaExistencias.splice(index, 1);
                        $scope.checkCambios();
                        $rootScope.showMessage(4, $scope.mensaje.borrardo, 3000);
                    });
            });
        });

    }

    $scope.validarId = function (id) {
        for (var i = 0; i < $scope.listaExistencias.length-1; i++) {
            if ($scope.listaExistencias[i]._id == id) {
                return true;
            }
        }
        return;
    }

    $scope.isEdited = function (edited) {
        return (edited) ? "danger" : "";
    }

    $scope.edit = function(existencia_almacen){
        if(!$scope.edicion.edicion) {
            $scope.edicion.edicion = true;
            existencia_almacen.edited = true;
            $scope.existenciaTemporal = angular.copy(existencia_almacen);
        }
    }

    $scope.mensaje = {
        mensaje: "",
        agregar: "Agregado exitosamente.",
        actualizar: "Actualizado exitosamente.",
        borrardo: " fue removido.", 
        completarCampos: "Favor de completar los campos.",
        errorDescripcion: "Favor revisar su Descipción.",
        errorUrl: "Favor revisar su URL.",
        errorDeConexion: "Error de conexión",
        errorCampo: "Favor revisar este campo.",
        borrar: "Está seguro que desea borrar ",
    }

    $scope.checkCambios = function () {
        $scope.hayCambios = false;
        for (var i in $scope.listaExistencias) {
            if (!$scope.listaExistencias[i].saved || $scope.listaExistencias[i].edited) {
                $scope.hayCambios = true;
                break;
            }
        }
    }


  });