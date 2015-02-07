'use strict';

var app = angular.module('symdevsApp');

app.factory('wsCliente', function (wsCrud) {

   var service = function () {};
   

   //nombre de la tabla
   service.prototype.tabla = '';

   service.prototype.getCliente = function(id){
      var crudCliente = wsCrud.getInstance('CLIENTE');
      var where = {
         'clienteId': id
      }
      var promise = crudCliente.getByParams(where)
         .success(function (data, status){
            return data;
         })
         .error(function (data, status){
            return data;
         })
      return promise;
   }

   service.prototype.getActividades = function(id){
      var crudActividad = wsCrud.getInstance('ACTIVIDAD');
      var where = {
         'cliente.clienteId': id
      }
      var promise = crudActividad.getByParams(where)
         .success(function (data, status){
            return data;
         })
         .error(function (data, status){
            return data;
         })
      return promise;
   }

   service.prototype.getOportunidades = function(id){
      var crudOportunidad = wsCrud.getInstance('OPORTUNIDAD');
      var where = {
         'cliente.clienteId': id
      }
      var promise = crudOportunidad.getByParams(where)
         .success(function (data, status){
            return data;
         })
         .error(function (data, status){
            return data;
         })
      return promise;
   }

   service.prototype.getClienteCampana = function (id) {
      var crudClienteCampana = wsCrud.getInstance('CLIENTECAMPANA');
      var where = {
         'cliente.clienteId': id
      }
      var promise = crudClienteCampana.getByParams(where)
         .success( function (data, status) {
            return data;
         })
         .error( function (data, status) {
            return data;
         })
      return promise;
   }

   service.prototype.getSettings = function () {
      var crudSettings = wsCrud.getInstance('SETTINGS');
      var promise = crudSettings.getOne()
         .success(function (data, status) {
            return data;
         })
         .error(function (data, status) {
            return data;
         })
      return promise;
   }

   // service.prototype.get = function () {
   //    var promise = $http.post('/mantenimiento/search', {
   //       tabla: this.tabla,
   //       obj: {}
   //    })
   //    .success( function (data, status) {
   //       return data;
   //    })
   //    .error( function (data, status) {
   //       return data;
   //    })
   //    return promise;
   // };
   // //debo hacer el prefiltrado en el servicio o en el controlador?
   // //en qué vista trabajaré. 
   // service.prototype.getOne = function (query) {
   //    var promise = $http.post('/mantenimiento/buscarPorId', {
   //       tabla: this.tabla,
   //       query: query

   //    }).success(function (data, status) {
   //       return data;

   //    }).error(function (data, status) {
   //       return data;
   //    });

   //    return promise;
   // };

   var ws = {
        getInstance : function () {
         var crud = new service()
         return crud;
        }
    }

   return ws;

});