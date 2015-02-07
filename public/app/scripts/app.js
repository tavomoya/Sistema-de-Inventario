'use strict';

/**
 * @ngdoc overview
 * @name yeomanApp
 * @description
 * # yeomanApp
 *
 * Main module of the application.
 */
angular
  .module('yeomanApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'ui.tree',
  'textAngular',
  'ui.tree',
  'ngGrid',
  'ui.utils',
  'dialogs.main',
  'angularValidator',
  'flowChart'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/almacen', {
        templateUrl: 'views/almacen.html',
        controller: 'AlmacenCtrl'
      })
      .when('/tipoInventario', {
        templateUrl: 'views/tipoInventario.html',
        controller: 'TipoInventarioCtrl'
      })
      .when('/articulos', {
        templateUrl: 'views/articulos.html',
        controller: 'ArticulosCtrl',
        resolve: {
          tipoInv: function (wsUtil) {
            var params = {
              filter: '{ }',
              // limit: 20,
              skip: 0,
              sort: 'Descripcion',
              search: '',
              tabla: 'TIPOINVENTARIO',
              fields: []
            }
            return wsUtil.getPaginatedSearch(params);
          } 
        }
      })
      .when('/existenciaAlmacen', {
        templateUrl: 'views/existenciaAlmacen.html',
        controller: 'ExistenciaAlmacenCtrl',
        resolve: {
          almacen: function (wsUtil) {
            var params = {
              filter: '{ }',
              // limit: 20,
              skip: 0,
              sort: 'Descripcion',
              search: '',
              tabla: 'ALMACEN',
              fields: []
            }
            return wsUtil.getPaginatedSearch(params);
          }, 
          articulo: function (wsUtil) {
            var params = {
              filter: '{ }',
              // limit: 20,
              skip: 0,
              sort: 'Descripcion',
              search: '',
              tabla: 'ARTICULO',
              fields: []
            }
            return wsUtil.getPaginatedSearch(params);
          } 
        }
      })
      .when('/transacciones', {
        templateUrl: 'views/transacciones.html',
        controller: 'TransaccionesCtrl',
        resolve: {
          articulo: function (wsUtil) {
            var params = {
              filter: '{ }',
              // limit: 20,
              skip: 0,
              sort: 'Descripcion',
              search: '',
              tabla: 'ARTICULO',
              fields: []
            }
            return wsUtil.getPaginatedSearch(params);
          },
          almacen: function (wsUtil) {
            var params = {
              filter: '{ }',
              // limit: 20,
              skip: 0,
              sort: 'Descripcion',
              search: '',
              tabla: 'ALMACEN',
              fields: []
            }
            return wsUtil.getPaginatedSearch(params);
          }  
        }
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/reportes', {
        templateUrl: 'views/reportes.html',
        controller: 'ReportesCtrl'
      })
      .when('/consultas', {
        templateUrl: 'views/consulta.html',
        controller: 'ConsultasCtrl', 
        resolve: {
          articulo: function (wsUtil) {
            var params = {
              filter: '{ }',
              // limit: 20,
              skip: 0,
              sort: 'Descripcion',
              search: '',
              tabla: 'ARTICULO',
              fields: []
            }
            return wsUtil.getPaginatedSearch(params);
          }, 
          almacen: function (wsUtil) {
            var params = {
              filter: '{ }',
              // limit: 20,
              skip: 0,
              sort: 'Descripcion',
              search: '',
              tabla: 'ALMACEN',
              fields: []
            }
            return wsUtil.getPaginatedSearch(params);
          },

          existencia: function (wsUtil) {
            var params = {
              filter: '{ }',
              // limit: 20,
              skip: 0,
              sort: 'Descripcion',
              search: '',
              tabla: 'EXISTENCIA_ALMACEN',
              fields: []
            }
            return wsUtil.getPaginatedSearch(params);
          },

          tipoInv: function (wsUtil) {
            var params = {
              filter: '{ }',
              // limit: 20,
              skip: 0,
              sort: 'Descripcion',
              search: '',
              tabla: 'TIPOINVENTARIO',
              fields: []
            }
            return wsUtil.getPaginatedSearch(params);
          }  
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  });
