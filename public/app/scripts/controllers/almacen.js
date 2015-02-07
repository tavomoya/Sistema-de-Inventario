'use strict';

/**
 * @ngdoc function
 * @name yeomanApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the yeomanApp
 */
angular.module('yeomanApp')
  .controller('AlmacenCtrl', function ($scope, $rootScope, $modal, $http, wsUtil, wsCrud, $window) {

    console.log('lala', $window.sessionStorage.logged)
    $rootScope.logged = $window.sessionStorage.logged;
  	$scope.listaAlmacen = [];
    $scope.hayCambios = false;
    $scope.filtrarPor = "";
    $scope.reverse = false;
    var almacenCRUD = wsCrud.getInstance('ALMACEN');
    $scope.edicion = {
        edicion: false,
        nuevo: false
    }
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
        sort: 'Descripcion',
        search: '',
        tabla: "ALMACEN",
        fields: '' 
   }

   //Metodo de Busqueda en la base de datos
   wsUtil.getPaginatedSearch(params)
    .success(function (data, status, header, config) {      
            $scope.listaAlmacen = data;//Guardar en una variable local
            console.log($scope.listaAlmacen);
            for(var i in data) {
                $scope.listaAlmacen[i] = data[i];
                $scope.listaAlmacen[i].saved = true;
                $scope.listaAlmacen[i].edited = false;
            }
    });

    //Funcion que me agrega un nuevo producto en la lista
    $scope.addArticulo = function () {
        //Objeto con la nueva etapa a insertar
        $scope.newAlmacen = {
            Descripcion: $scope.newDescripcion,
            estado: $scope.newEstado,
            saved: true,
            edited: false
        };

        //Utilizo esta copia para poder borrar los estados de guardado o editado
        var copiaAlmacen = angular.copy($scope.newAlmacen);
        //Borro los campos de la base de datos
        delete copiaAlmacen.saved;
        delete copiaAlmacen.edited;

        $scope.listaAlmacen.push($scope.newAlmacen);

        almacenCRUD.insert(copiaAlmacen)
            .success(function(){
                 $rootScope.showMessage(1, $scope.mensaje.agregar, 3500);
                 console.log('lo que me quedo', $scope.listaAlmacen);
                 // $scope.$apply();
            });

        $scope.newDescripcion = "";
        $scope.newEstado = "";
    }

    $scope.actualizarAlmacen = function(item){

        var index = $scope.listaAlmacen.indexOf(item);

        //Objeto que utilizare como parametro de busqueda
        var params = {
            query: { _id: $scope.almacenTemporal._id },
            obj: $scope.listaAlmacen[index],
        };

        console.log(params.query);
        almacenCRUD.getByParams(params.query)
            .success(function (data, status) { 
            console.log(data)

                var id = $scope.listaAlmacen[$scope.listaAlmacen.length - 1]._id;
                if (typeof data == "object" && $scope.validarId(id) && !$scope.listaAlmacen[index].saved) {
                $scope.showMessage(0, "Este producto ya existe.", 3000);
                return;
                }

                delete $scope.listaAlmacen[index].saved;
                delete $scope.listaAlmacen[index].edited;
                var almacen = angular.copy($scope.listaAlmacen[index]);
                almacenCRUD.update(params.query, almacen)
                    .success(function (data, status, header, config){
                        $rootScope.showMessage(1, $scope.mensaje.actualizar, 3500);
                        $scope.listaAlmacen[index].saved = true;
                        $scope.listaAlmacen[index].edited = false;                
                        if($scope.edicion.nuevo)
                            $scope.edicion.nuevo = false;
                        else
                            $scope.edicion.edicion = false;
                        $scope.checkCambios();

                    });
            });

    }

    //Funcion que se utiliza para cancelar una actualizacion
    $scope.cancelUpdate = function(almacen){
        if($scope.edicion.edicion) {
            $scope.edicion.edicion = false;
            almacen.edited = false;    
        }
    }

    //Funcion que se utiliza para eliminar un ciclo
    $scope.borrarAlmacen = function(item){
    	console.log("Entre al borrador")
        var index = $scope.listaAlmacen.indexOf(item);
        //Objeto que utilizare como parametro para eliminar
        console.log("Este es el que se va a borrar", $scope.listaAlmacen[index]);
        // return;
        var params = {
            tabla: 'ALMACEN',
            obj: { Descripcion: $scope.listaAlmacen[index].Descripcion }
        };

        if(!$scope.listaAlmacen[index].saved) {
            $scope.listaAlmacen.splice(index, 1);
            $scope.checkCambios();
            return;
        }

        almacenCRUD.getByParams(params.obj).success(function(data, status, headers, config){
            console.log('esta es la data que traigo con ese query', data[0]);
            $rootScope.showModal("Eliminar Almacen", "Seguro que desea eliminar este almacen?", function () {
                console.log("Estoy borrando", data[0]._id)
                almacenCRUD.delete(data[0])
                    .success(function(data,status,headers,config){
                        console.log('borre')
                        $scope.listaAlmacen.splice(index, 1);
                        $scope.checkCambios();
                        $rootScope.showMessage(4, $scope.mensaje.borrardo, 3000);
                    });
            });
        });

    }

    $scope.validarId = function (id) {
        for (var i = 0; i < $scope.listaAlmacen.length-1; i++) {
            if ($scope.listaAlmacen[i]._id == id) {
                return true;
            }
        }
        return;
    }

    $scope.isEdited = function (edited) {
        return (edited) ? "danger" : "";
    }

    $scope.edit = function(almacen){
        if(!$scope.edicion.edicion) {
            $scope.edicion.edicion = true;
            almacen.edited = true;
            $scope.almacenTemporal = angular.copy(almacen);
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
        for (var i in $scope.listaAlmacen) {
            if (!$scope.listaAlmacen[i].saved || $scope.listaAlmacen[i].edited) {
                $scope.hayCambios = true;
                break;
            }
        }
    }


  });