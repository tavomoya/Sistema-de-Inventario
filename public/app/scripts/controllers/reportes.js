'use strict';

/**
 * @ngdoc function
 * @name yeomanApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the yeomanApp
 */
angular.module('yeomanApp')
  .controller('ReportesCtrl', function ($scope, $rootScope, $modal, $http, wsUtil, wsCrud, $window, dialogs) {

    console.log('Controlador de Reportes')

    //Funcion que Genera el Reporte
    $scope.genReOrden = function () {
        var dialog = dialogs.create('views/firstReport.html', '1stReportCtrl');
        dialog.result
        .then(function (data) {
            console.log('Ya sali del dialogo')
        });
    }

    $scope.genTransacciones = function () {
        var dialog = dialogs.create('views/secondReport.html', '2ndReportCtrl');
        dialog.result
        .then(function (data) {
            console.log('Ya sali del dialogo')
        });
    }

    $scope.genExistencia = function () {
        var dialog = dialogs.create('views/thirdReport.html', '3rdReportCtrl');
        dialog.result
        .then(function (data) {
            console.log('Ya sali del dialogo')
        });      
    }      

  });