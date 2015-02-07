'use strict';

var app = angular.module('yeomanApp');

app.controller('AlertCtrl', function ($scope, $rootScope, $timeout) {
  $scope.alerts = [];
  //Funcion para mostrar mensaje 
  var addAlert = function (type, message, time) {
    $scope.alerts.push({
      type: type,
      msg: message
    });
    $timeout(function () {
      $scope.closeAlert();
    }, time);
  };
  $scope.closeAlert = function () {
    $scope.alerts.shift();
  };
  $rootScope.showMessage = function (errorOrSuccess, msg, time) {
    /* 
     ** type aceptara los siguientes parametros acorde a
     ** lo que necesiten:
     ** 0 <--- danger
     ** 1 <--- success
     ** 2 <--- warning
     ** 3 <--- info
     */
    var time = (typeof time == 'number') ? parseInt(time) : 10000;
    var typeOfMessage;
    switch (errorOrSuccess) {
    case 0:
      typeOfMessage = 'danger';
      break;
    case 1:
      typeOfMessage = 'success';
      break;
    case 2:
      typeOfMessage = 'warning';
      break;
    case 3:
      typeOfMessage = 'info';
      break;
    default:
      typeOfMessage = 'info';
      break;
    }
    addAlert(typeOfMessage, msg, time);
  };
});

app.controller('ModalCtrl', function ($modal, $rootScope) {

  var open = function (title, content, funcOk, funcCancel) {
    var modalInstance = $modal.open({
      templateUrl: 'myModalContent.html',
      controller: ModalInstanceCtrl,
      size: 'sm',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        params: function () {
          return {
            title: title,
            content: content,
            funcOk: funcOk,
            funcCancel: (typeof (funcCancel) != 'undefined') ? funcCancel : function () {}
          }
        }
      }
    });
  }

  var ModalInstanceCtrl = function ($scope, $modalInstance, params) {
    $scope.title = params.title;
    $scope.content = params.content;
    $scope.ok = function () {
      params.funcOk();
      $modalInstance.close();
    };

    $scope.cancel = function () {
      params.funcCancel();
      $modalInstance.dismiss('cancel');
    };
  };

  $rootScope.showModal = function (title, content, funcOk, funcCancel) {
    open(title, content, funcOk, funcCancel);
  }
});

// Controlador para el modal de oficiales.
app.controller('ModalOfficialCtrl', function ($modal, $rootScope) {

  var open = function (title, officialList, funcSelect, funcCancel) {
    var modalInstance = $modal.open({
      templateUrl: 'views/modalOfficial.html',
      controller: ModalOfficialInstanceCtrl,
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        params: function () {
          return {
            title: title,
            officialList: officialList,
            funcSelect: funcSelect,
            funcCancel: (typeof (funcCancel) != 'undefined') ? funcCancel : function () {}
          }
        }
      }
    });
  };

  var ModalOfficialInstanceCtrl = function ($scope, $modalInstance, params) {
    
    $scope.filter = null;
    $scope.myData = params.officialList;
    $scope.title = params.title;
    $scope.filterOptions = {
      filterText: ''
    };
    
    $scope.gridOptions = {
      data: 'myData',
      enablePinning: false,
      multiSelect: false,
      selectedItems: [],
      filterOptions:  $scope.filterOptions,
      afterSelectionChange: function () {
        params.funcSelect($scope.gridOptions.selectedItems[0]);
        $modalInstance.close();
      },
      columnDefs: [{ field: "usuarioId", displayName: 'Id', width: 140, pinned: true },
                  { field: "oficial", displayName: 'Nombre', width: 236 },
                  { field: "rol", displayName: 'Rol', width: 130 }],
    }
    
    $scope.cancel = function () {
      params.funcCancel();
      $modalInstance.dismiss('cancel');
    };
  };

  $rootScope.showModalOfficial = function (title, officialList, funcSelect, funcCancel) {
    open(title, officialList, funcSelect, funcCancel);
  }
});

app.controller('SessionCtrl', function ($scope, $rootScope, $timeout, $location, $window, $http) {
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /************* Funciones publicas *************/
 	
	//Funcion para conectarse a los web services en general
  $rootScope.objectCRUD = function (tabla) {
    this.tabla = tabla;
  };
	// Definicion de las funcionalidades del objeto CRUD
	$rootScope.objectCRUD.prototype = {
    get: function (callback, callbackFail) {
      $http.post('/mantenimiento/search', {
        tabla: this.tabla,
        obj: {}
      }).success(function (data, status) {
        callback(data);
      }).error(function (data, status) {
        callbackFail(data);
      });
    },
    getOne: function (query, callback, callbackFail) {
      $http.post('/mantenimiento/buscarPorId', {
        tabla: this.tabla,
        query: query
      }).success(function (data, status) {
        callback(data);
      }).error(function (data, status) {
        callbackFail(data);
      });
    },
    insert: function (objeto, callback, callbackFail) {
      $http.post('/mantenimiento/new', {
        tabla: this.tabla,
        obj: objeto
      }).success(function (data, status) {
        callback(data);
      }).error(function (data, status) {
        callbackFail(data);
      });
    },
    update: function (query, objeto, callback, callbackFail) {
      $http.post('/mantenimiento/update', {
        tabla: this.tabla,
        query: query,
        obj: objeto
      }).success(function (data, status) {
        callback(data);
      }).error(function (data, status) {
        callbackFail(data);
      });
    },
    delete: function (objeto, callback, callbackFail) {
      $http.post('/mantenimiento/delete', {
        tabla: this.tabla,
        obj: objeto
      }).success(function (data, status) {
        callback(data);
      }).error(function (data, status) {
        callbackFail(data);
      });
    },
    getByParams: function (params, callback, callbackFail) {
      $http.post('/mantenimiento/search', {
        tabla: this.tabla,
        obj: params
      }).success(function (data, status) {
        callback(data);
      }).error(function (data, status) {
        callbackFail(data);
      });
    },
    count: function (filter, callback, callbackFail) {
      $http.post('/mantenimiento/count', {
        tabla: this.tabla,
        obj: filter
      }).success(function (data, status) {
        callback(data);
      }).error(function (data, status) {
        callbackFail(data);
      });
    }
  };
	// Funcion count
	$rootScope.count = function (contactadoOrNot, callback) {
    $http.post('/api/prospectos/count', {
      contactado: contactadoOrNot,
      user: $rootScope.userData
    }).success(function (data, status, header, config) {
      callback(data);
    });
  };
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /************* Inicializacion o codigo implementado *************/

  console.log('-----------BEGIN--------------------');
  console.log($window.sessionStorage.userData);
  if ($window.sessionStorage.userData == undefined) {
    console.log('-----------FINISH--------------------');
    $rootScope.isAuthenticated = false;
    $rootScope.userData = [];
    $location.path('/login');
  } else if ($rootScope.userData == undefined) {
    $rootScope.userData = JSON.parse($window.sessionStorage.userData);
    console.log($rootScope.userData);
    $rootScope.isAuthenticated = true;
  }

	if ($rootScope.isAuthenticated) {
		$rootScope.count(false, function (data) {
			console.log(data);
			$rootScope.cantidadClientes = data;
		});
	}

});