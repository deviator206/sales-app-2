'use strict';
angular.module('salesApp.modal.print-modal-directive', ['ui.bootstrap'])
.directive('printModalDirective', function() {
    return {
        restrict: 'E',
        templateUrl: 'components/modal/modalContent.html',
        controller: function ($scope) {     
            
            console.log($scope.selectedProducts);
            
        }
    };
});



