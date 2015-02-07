'use strict';

/**
 * @ngdoc function
 * @name yeomanApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the yeomanApp
 */
angular.module('yeomanApp')
  .controller('TipoInventarioCtrl', function ($scope, $rootScope, $modal, $http, wsUtil, wsCrud, $window) {

    console.log('lala', $window.sessionStorage.logged)
    $rootScope.logged = $window.sessionStorage.logged;
  	$scope.listaTipoInv = [];
    $scope.hayCambios = false;
    $scope.filtrarPor = "";
    $scope.reverse = false;
    var tipoInvCRUD = wsCrud.getInstance('TIPOINVENTARIO');
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
        tabla: "TIPOINVENTARIO",
        fields: '' 
   }

   //Metodo de Busqueda en la base de datos
   wsUtil.getPaginatedSearch(params)
    .success(function (data, status, header, config) {      
            $scope.listaTipoInv = data;//Guardar en una variable local
            console.log($scope.listaTipoInv);
            for(var i in data) {
                $scope.listaTipoInv[i] = data[i];
                $scope.listaTipoInv[i].saved = true;
                $scope.listaTipoInv[i].edited = false;
            }
    });

    //Funcion que me agrega un nuevo producto en la lista
    $scope.addInventario = function () {
        //Objeto con la nueva etapa a insertar
        $scope.newTipoInv = {
            Descripcion: $scope.newDescripcion,
            cuentaContable: $scope.newCuenta,
            estado: $scope.newEstado,
            saved: true,
            edited: false
        };

        //Utilizo esta copia para poder borrar los estados de guardado o editado
        //Ya que no me interesa guardarlos en la base de datos
        var copiaTipoInv = angular.copy($scope.newTipoInv);
        //Borro los campos de la base de datos
        delete copiaTipoInv.saved;
        delete copiaTipoInv.edited;

        $scope.listaTipoInv.push($scope.newTipoInv);

        tipoInvCRUD.insert(copiaTipoInv)
            .success(function(){
                 $rootScope.showMessage(1, $scope.mensaje.agregar, 3500);
                 console.log('lo que me quedo', $scope.listaTipoInv);
                 // $scope.$apply();
            });

        $scope.newDescripcion = "";
        $scope.newCuenta = "";
        $scope.newEstado = "";
    }

    $scope.actualizarTipoInv = function(item){

        var index = $scope.listaTipoInv.indexOf(item);

        //Objeto que utilizare como parametro de busqueda
        var params = {
            query: { _id: $scope.tipoInvTemporal._id },
            obj: $scope.listaTipoInv[index],
        };

        console.log(params.query);
        tipoInvCRUD.getByParams(params.query)
            .success(function (data, status) { 
            console.log(data)

                var id = $scope.listaTipoInv[$scope.listaTipoInv.length - 1]._id;
                if (typeof data == "object" && $scope.validarId(id) && !$scope.listaTipoInv[index].saved) {
                $scope.showMessage(0, "Este producto ya existe.", 3000);
                return;
                }

                delete $scope.listaTipoInv[index].saved;
                delete $scope.listaTipoInv[index].edited;
                var tipoInv = angular.copy($scope.listaTipoInv[index]);
                tipoInvCRUD.update(params.query, tipoInv)
                    .success(function (data, status, header, config){
                        $rootScope.showMessage(1, $scope.mensaje.actualizar, 3500);
                        $scope.listaTipoInv[index].saved = true;
                        $scope.listaTipoInv[index].edited = false;                
                        if($scope.edicion.nuevo)
                            $scope.edicion.nuevo = false;
                        else
                            $scope.edicion.edicion = false;
                        $scope.checkCambios();

                    });
            });

    }

    //Funcion que se utiliza para cancelar una actualizacion
    $scope.cancelUpdate = function(tipoInv){
        if($scope.edicion.edicion) {
            $scope.edicion.edicion = false;
            tipoInv.edited = false;    
        }
    }

    //Funcion que se utiliza para eliminar un ciclo
    $scope.borrarTipoInv = function(item){
    	console.log("Entre al borrador")
        var index = $scope.listaTipoInv.indexOf(item);
        //Objeto que utilizare como parametro para eliminar
        console.log("Este es el que se va a borrar", $scope.listaTipoInv[index]);
        // return;
        var params = {
            tabla: 'TIPOINVENTARIO',
            obj: { Descripcion: $scope.listaTipoInv[index].Descripcion }
        };

        if(!$scope.listaTipoInv[index].saved) {
            $scope.listaTipoInv.splice(index, 1);
            $scope.checkCambios();
            return;
        }

        tipoInvCRUD.getByParams(params.obj).success(function(data, status, headers, config){
            console.log('esta es la data que traigo con ese query', data[0]);
            $rootScope.showModal("Eliminar Tipo de Inventario", "Seguro que desea eliminar este Tipo de Inventario?", function () {
                console.log("Estoy borrando", data[0]._id)
                tipoInvCRUD.delete(data[0])
                    .success(function(data,status,headers,config){
                        console.log('borre')
                        $scope.listaTipoInv.splice(index, 1);
                        $scope.checkCambios();
                        $rootScope.showMessage(4, $scope.mensaje.borrardo, 3000);
                    });
            });
        });

    }

    $scope.validarId = function (id) {
        for (var i = 0; i < $scope.listaTipoInv.length-1; i++) {
            if ($scope.listaTipoInv[i]._id == id) {
                return true;
            }
        }
        return;
    }

    $scope.isEdited = function (edited) {
        return (edited) ? "danger" : "";
    }

    $scope.edit = function(tipoInv){
        if(!$scope.edicion.edicion) {
            $scope.edicion.edicion = true;
            tipoInv.edited = true;
            $scope.tipoInvTemporal = angular.copy(tipoInv);
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
        for (var i in $scope.listaTipoInv) {
            if (!$scope.listaTipoInv[i].saved || $scope.listaTipoInv[i].edited) {
                $scope.hayCambios = true;
                break;
            }
        }
    }


  });