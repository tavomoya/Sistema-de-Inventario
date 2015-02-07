'use strict';

var app = angular.module('symdevsApp');

/**
* @function decimalsOnly
* @memberOf angular.symdevsApp
* @description Evita que un campo acepte valores alfanumericos, solo decimales
*/
app.directive('decimalsOnly', function(){
	return {
		require: 'ngModel',
		link: function(scope, element, attrs, modelCtrl) {
			modelCtrl.$parsers.push(function (inputValue) {
				if (inputValue == undefined) return '' 
				var arrInput = inputValue.split(".");
				
				arrInput[0] = arrInput[0].replace(/[^0-9]/g, '');
				if (arrInput.length >= 2) {
					arrInput.length = 2;
					arrInput[1] = arrInput[1].replace(/[^0-9]/g, '');
				}

				var transformedInput = arrInput.join(".");
				if (transformedInput!=inputValue) {
					modelCtrl.$setViewValue(transformedInput);
					modelCtrl.$render();
				}         
				return transformedInput;         
			});
		}
	};
});

/**
* @function numbersOnly
* @memberOf angular.symdevsApp
* @description Evita que un campo acepte valores alfanumericos
*/
app.directive('numbersOnly', function(){
	return {
		require: 'ngModel',
		link: function(scope, element, attrs, modelCtrl) {
			modelCtrl.$parsers.push(function (inputValue) {
				if (inputValue == undefined) return '';

				var transformedInput = inputValue.replace(/[^0-9]/g, '');
				
				if (transformedInput!=inputValue) {
					modelCtrl.$setViewValue(transformedInput);
					modelCtrl.$render();
				}         
				return transformedInput;         
			});
		}
	};
});


app.directive('cedulaValida', function($rootScope){
	return{
		require: 'ngModel',
		restrict: 'A',
		link: function(scope, element, attrs){
			element.blur(function(){
				if (scope.isCedula){
					if(element[0].value != ''){
						var array = element[0].value.split('-');
		    			var cedula = array[0] + array[1]; 
		    			var verificador = array[2]; 
		    			var suma = 0; 
		    
		    			for (var i=0; i<cedula.length; i++) 
		    			{ 
		       				var multiplicador = 0; 
		         			if((i % 2) == 0){
		         				multiplicador = 1
		         			} 
		         			else {
		         				multiplicador = 2
		         			} 
		         			var resultado = cedula.substr(i,1) * multiplicador; 
		         			if (resultado > 9) 
		         			{ 
		              			resultado = resultado.toString(); 
		              			resultado = parseInt(resultado.substr(0,1)) + parseInt(resultado.substr(1,1)); 
		         			}
		         			suma += parseInt(resultado); 
		    			} 

		    			if ((10 - (suma % 10)) % 10 == verificador && array[0] != "000") { 
		      				scope.valid = true; 
		    			} 
		    			else {
		    				scope.$apply(function(){
		    					element.focus();
		    					$rootScope.showMessage(0,'Se ha ingresado una cedula invalida, favor corregirla.',2000);
		    					scope.valid = false; 
		    				})
		    			} 	
					}
				}
			});
		}
	};
});

app.directive('clientCard', function(){
	return {
		require: 'ngModel',
		templateUrl : 'views/clientCard.html',
		restrict : 'E',
		scope : {
			cliente: '=',
			manager: '='

		}
	};
});


app.directive( 'popPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'template/popover/popover.html'
  };
})

app.directive('pop', function pop ($tooltip, $timeout) {
	var tooltip = $tooltip('pop', 'pop', 'event');
	var compile = angular.copy(tooltip.compile);
	tooltip.compile = function (element, attrs) {      
	  var first = true;
	  attrs.$observe('popShow', function (val) {
	    if (JSON.parse(!first || val || false)) {
	      $timeout(function () {
	        element.triggerHandler('event');
	      });
	    }
	    first = false;
	  });
	  return compile(element, attrs);
	};
	return tooltip;
});
