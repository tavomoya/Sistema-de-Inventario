'use strict';

/**
 * @ngdoc function
 * @name yeomanApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the yeomanApp
 */
angular.module('yeomanApp')
  .controller('ArticulosCtrl', function ($scope, $rootScope, $modal, $http, wsUtil, wsCrud, tipoInv, $window) {

    console.log('lala', $window.sessionStorage.logged)
    $rootScope.logged = $window.sessionStorage.logged;
  	$scope.listaArticulos = [];
    $scope.hayCambios = false;
    $scope.filtrarPor = "";
    $scope.reverse = false;
    $scope.inventarios = tipoInv.data;
    var articulosCRUD = wsCrud.getInstance('ARTICULO');
    $scope.edicion = {
        edicion: false,
        nuevo: false
    };
    console.log($scope.inventarios);
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
        tabla: "ARTICULO",
        fields: '' 
   }

   //Metodo de Busqueda en la base de datos
   wsUtil.getPaginatedSearch(params)
    .success(function (data, status, header, config) {      
            $scope.listaArticulos = data;//Guardar en una variable local
            console.log($scope.listaArticulos);
            for(var i in data) {
                $scope.listaArticulos[i] = data[i];
                $scope.listaArticulos[i].saved = true;
                $scope.listaArticulos[i].edited = false;
            }
    });

    //Funcion que me agrega un nuevo producto en la lista
    $scope.addArticulo = function () {
        //Objeto con la nueva etapa a insertar
        $scope.newArticulo = {
            Descripcion: $scope.newDescripcion,
            existencia: $scope.newExistencia,
            tipoInventario: $scope.newTipoInv,
            costo: $scope.newCosto,
            estado: $scope.newEstado,
            saved: true,
            edited: false
        };

        //Utilizo esta copia para poder borrar los estados de guardado o editado
        //Ya que no me interesa guardarlos en la base de datos
        var copiaArticulo = angular.copy($scope.newArticulo);
        //Borro los campos de la base de datos
        delete copiaArticulo.saved;
        delete copiaArticulo.edited;

        $scope.listaArticulos.push($scope.newArticulo);

        articulosCRUD.insert(copiaArticulo)
            .success(function(){
                 $rootScope.showMessage(1, $scope.mensaje.agregar, 3500);
                 console.log('lo que me quedo', $scope.listaArticulos);
                 // $scope.$apply();
            });

        $scope.newDescripcion = "";
        $scope.newExistencia = "";
        $scope.newTipoInv ="";
        $scope.newCosto = "";
        $scope.newEstado = "";
    }

    $scope.actualizarArticulo = function(item){

        var index = $scope.listaArticulos.indexOf(item);

        //Objeto que utilizare como parametro de busqueda
        var params = {
            query: { _id: $scope.ArticuloTemporal._id },
            obj: $scope.listaArticulos[index],
        };

        console.log(params.query);
        articulosCRUD.getByParams(params.query)
            .success(function (data, status) { 
            console.log(data)

                var id = $scope.listaArticulos[$scope.listaArticulos.length - 1]._id;
                if (typeof data == "object" && $scope.validarId(id) && !$scope.listaArticulos[index].saved) {
                $scope.showMessage(0, "Este producto ya existe.", 3000);
                return;
                }

                delete $scope.listaArticulos[index].saved;
                delete $scope.listaArticulos[index].edited;
                var articulo = angular.copy($scope.listaArticulos[index]);
                articulosCRUD.update(params.query, articulo)
                    .success(function (data, status, header, config){
                        $rootScope.showMessage(1, $scope.mensaje.actualizar, 3500);
                        $scope.listaArticulos[index].saved = true;
                        $scope.listaArticulos[index].edited = false;                
                        if($scope.edicion.nuevo)
                            $scope.edicion.nuevo = false;
                        else
                            $scope.edicion.edicion = false;
                        $scope.checkCambios();

                    });
            });

    }

    //Funcion que se utiliza para cancelar una actualizacion
    $scope.cancelUpdate = function(articulo){
        if($scope.edicion.edicion) {
            $scope.edicion.edicion = false;
            articulo.edited = false;    
        }
    }

    //Funcion que se utiliza para eliminar un ciclo
    $scope.borrarArticulo = function(item){
    	console.log("Entre al borrador")
        var index = $scope.listaArticulos.indexOf(item);
        //Objeto que utilizare como parametro para eliminar
        console.log("Este es el que se va a borrar", $scope.listaArticulos[index]);
        // return;
        var params = {
            tabla: 'ARTICULO',
            obj: { Descripcion: $scope.listaArticulos[index].Descripcion }
        };

        if(!$scope.listaArticulos[index].saved) {
            $scope.listaArticulos.splice(index, 1);
            $scope.checkCambios();
            return;
        }

        articulosCRUD.getByParams(params.obj).success(function(data, status, headers, config){
            console.log('esta es la data que traigo con ese query', data[0]);
            $rootScope.showModal("Eliminar Tipo de Inventario", "Seguro que desea eliminar este Tipo de Inventario?", function () {
                console.log("Estoy borrando", data[0]._id)
                articulosCRUD.delete(data[0])
                    .success(function(data,status,headers,config){
                        console.log('borre')
                        $scope.listaArticulos.splice(index, 1);
                        $scope.checkCambios();
                        $rootScope.showMessage(4, $scope.mensaje.borrardo, 3000);
                    });
            });
        });

    }

    $scope.validarId = function (id) {
        for (var i = 0; i < $scope.listaArticulos.length-1; i++) {
            if ($scope.listaArticulos[i]._id == id) {
                return true;
            }
        }
        return;
    }

    $scope.isEdited = function (edited) {
        return (edited) ? "danger" : "";
    }

    $scope.edit = function(articulo){
        if(!$scope.edicion.edicion) {
            $scope.edicion.edicion = true;
            articulo.edited = true;
            $scope.ArticuloTemporal = angular.copy(articulo);
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
        for (var i in $scope.listaArticulos) {
            if (!$scope.listaArticulos[i].saved || $scope.listaArticulos[i].edited) {
                $scope.hayCambios = true;
                break;
            }
        }
    }


  });