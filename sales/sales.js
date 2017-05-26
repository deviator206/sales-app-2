'use strict';
angular.module('salesApp.sales', ['ngRoute' , 'smart-table', 'ui.bootstrap'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/sales', {
    templateUrl: 'sales/sales.html',
    controller: 'SalesCtrl'
  });
}])
.controller('SalesCtrl', ['$scope', '$http', '$uibModal', '$log' ,function($scope, $http, $modal, $log) {
    $scope.customerDetails = {
      "id": "",
      "name": "",
      "address": "",
      "phone": ""
    };
    $scope.paymentInfo = {
      paymentType: "cash",
      paymentTypes: [{name: "Cash", value: "cash"},
                    {name: "Card Pyment", value: "card"},
                    {name: "Cheque", value: "cheq"}],
      cardTypes:["RuPay", "VISA", "MaeterCard", "American Express", "Chase", "Discover"],
      cash: {
        amount:0
      },
      card:{
        amount:0,
        bank:'',
        cardNumber:'',
        expDate:'',
        cardNetwork:'',
        cardBank:''
      },
      cheq:{
        amount:0,
        bank:'',
        chequeNo:'',
        chequeDate:''
      }
    };
    
    $scope.date = new Date();
    $scope.dateValue = null;
    $scope.asyncSelected = '';
    $scope.salesDate = new Date();
    $scope.dateOptions = {};
    $scope.selectedProducts = [];
    $scope.salesResponseData = [];
    $scope.taxTypes = [
        {name: "VAT-1", value: "13.5"},
        {name: "VAT-2", value: "5.5"},
        {name: "VAT-3", value: "8.5"},
        {name: "Service Tax", value: "13.5"},
        {name: "NONE", value: "0"}
    ];
    
    $scope.taxTypeTotal = {};
    
    var setInitialValuforTotals = function(){
        return {
            taxAmmount:0,
            totalPrice:0,
            grandTotal:0,
            totalItems:0
        }
    };
    var jsDateConversionFunction = function(now) {
      var year = "" + now.getFullYear();
      var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
      var day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
      var hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
      var minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
      var second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
      $scope.dateValue = day + "-" + month + "-" + year + " (" + hour + ":" + minute + ":" + second  + ")";
      return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    }    
    
    var setCurrentProductBlank = function(){
        $scope.curentProduct = { orderDate:jsDateConversionFunction($scope.salesDate), name: "",  model: "",  sn: "",  quantity: "", price: "", totalPrice:0, taxType:0, taxValue:0, taxAmmount:0, grandTotal:0 };
        return $scope.curentProduct;
    };
    
    var toDecimalPrecision = function(amount, decimalPosition){
        if(decimalPosition == undefined || isNaN(decimalPosition)){
            decimalPosition = 2;
        }
        if(amount){
            amount = parseFloat(amount,10);
            amount = amount.toFixed(decimalPosition);
            amount = parseFloat(amount,10);
        }else{
            debugger;    
        }
        
        return amount;
    }
    
    var calculateTotal = function(){
        var selProLen = $scope.selectedProducts.length;
        $scope.productTotal = setInitialValuforTotals();
        if(selProLen > 0){
            for(var i=0; i<selProLen; i++){
                $scope.productTotal.taxAmmount += toDecimalPrecision($scope.selectedProducts[i].taxAmmount);
                $scope.productTotal.totalPrice += toDecimalPrecision($scope.selectedProducts[i].totalPrice);
                $scope.productTotal.grandTotal += toDecimalPrecision($scope.selectedProducts[i].grandTotal);
                $scope.productTotal.totalItems += toDecimalPrecision($scope.selectedProducts[i].quantity);
            }
        }

        $scope.productTotal.taxAmmount = toDecimalPrecision($scope.productTotal.taxAmmount, 2);
        $scope.productTotal.totalPrice = toDecimalPrecision($scope.productTotal.totalPrice, 2);
        $scope.productTotal.grandTotal = toDecimalPrecision($scope.productTotal.grandTotal, 2);
        $scope.productTotal.totalItems = toDecimalPrecision($scope.productTotal.totalItems, 2);

        
        $scope.paymentInfo.cash.amount = $scope.productTotal.grandTotal;
        $scope.paymentInfo.cheq.amount = $scope.productTotal.grandTotal;
        $scope.paymentInfo.card.amount = $scope.productTotal.grandTotal;
        
    };

    var getItemScopeMappedValue = function(type){
        
        var returnVal = "";
        switch(type){
            case "NAME": 
               returnVal = $scope.curentProduct.name;
            break;
            case "MODEL": 
               returnVal = $scope.curentProduct.model;
            break;
            case "SN": 
               returnVal = $scope.curentProduct.sn;
            break;
            default:
                returnVal = "";            
        }
        return returnVal;
        
    };
    
    var getTaxValue = function(taxType){
            var taxValue = 0;
            for(var k in $scope.taxTypes){
                if($scope.taxTypes[k].name == taxType){
                      taxValue = $scope.taxTypes[k].value;
                }
            }
        return taxValue;
    }

    var setCurrentProductTax = function(taxType){
        $scope.curentProduct.taxType =  taxType;
        $scope.curentProduct.taxValue = parseFloat(getTaxValue(taxType),10);
    };
    
    var salesAjaxCall = function(payload){
        $http({
            method : "POST",
            url : 'fixture/sales.json?v='+(Math.random()),
            data : payload
        }).then(function mySuccess(response) {
            console.log(response.data);
            $scope.salesResponseData = response.data;
            console.log($scope.salesResponseData);
            console.log($scope.customerDetails);
            $scope.open();
        }, function myError(response) {
            //$scope.myWelcome = response.statusText;
        });        
        
    };
    
    $scope.curentProduct = setCurrentProductBlank();

    $scope.productTotal = setInitialValuforTotals();

    $scope.customerList = function(val) {
        
        //return $http.get('http://10.20.116.112:8080/vogellaRestImpl/rest/customer/serach-customer',{
        return $http.get('fixture/customer.json?text='+(Math.random()),{
          params: {
            text: val
          }
        }).then(function(response){
          return response.data.customerServiceResponseList.map(function(item){
             return item;
          });
        });
    };

    $scope.productList = function(val, type) {
        return $http.get('fixture/item-list.json?v='+Math.random(), {
        //return $http.get('http://10.20.116.112:8080/vogellaRestImpl/rest/product/search-product',{
          params: {
            text: val,
            type: type
          }
        }).then(function(response){
             return response.data.singleProductModelList.map(function(item){
             return item;
          });
        });
    };
      
    $scope.selectCustomerFrmList = function(value){
        $scope.customerDetails.name = value.name || '';
        $scope.customerDetails.id = value.id || null;
        $scope.customerDetails.phone = value.phone || '';
        $scope.customerDetails.address = value.address || '';
    }

    $scope.selectProductFrmList = function(value, type){
        $scope.curentProduct.id = value.id || null;
        $scope.curentProduct.name = value.name || '';
        $scope.curentProduct.model = value.model || '';
        $scope.curentProduct.sn = value.sn || '';
        $scope.curentProduct.price = parseFloat(value.price, 10) || null;
        $scope.curentProduct.taxType = value.taxType || '';
        $scope.curentProduct.taxRate = parseFloat(value.taxRate, 10) || 0;
        $scope.curentProduct.quantity = 1;
        setCurrentProductTax($scope.curentProduct.taxType);
    };
    
    $scope.performSalesOperation = function(){
        var payInfoPayLoad = angular.copy($scope.paymentInfo[$scope.paymentInfo.paymentType]);
            payInfoPayLoad.type = $scope.paymentInfo.paymentType;
        var payLoad = {
            paymentInfo:[payInfoPayLoad],
            customerInfo:angular.copy($scope.customerDetails),
            productInfo:angular.copy($scope.selectedProducts)
        };
        salesAjaxCall(payLoad);
    };

    $scope.onTaxChange = function(){
        setCurrentProductTax($scope.curentProduct.taxType);
    }

    $scope.addProduct = function(){
        
        $scope.curentProduct.quantity = parseInt($scope.curentProduct.quantity, 10);
        if(!isNaN($scope.curentProduct.quantity) && !isNaN($scope.curentProduct.price)){
            $scope.curentProduct.totalPrice = toDecimalPrecision($scope.curentProduct.quantity * $scope.curentProduct.price);
        }
        if(!isNaN($scope.curentProduct.totalPrice) && !isNaN($scope.curentProduct.taxValue)){
            $scope.curentProduct.taxAmmount = toDecimalPrecision(($scope.curentProduct.totalPrice * $scope.curentProduct.taxValue)/100);
        }
        if(!isNaN($scope.curentProduct.taxAmmount)){
            $scope.curentProduct.grandTotal = toDecimalPrecision($scope.curentProduct.taxAmmount + $scope.curentProduct.totalPrice);
        }
        if($scope.isValidProductInfoforAdd()){
            $scope.selectedProducts.push($scope.curentProduct);  
            calculateTotal();
            $scope.taxTypeTotal = calculateTaxTypeTotal();
            setCurrentProductBlank();
            $scope.setProductContainerToPristine();
        }
    };
    
    $scope.setProductContainerToPristine = function(){
        $scope.salesForm.currentProductName.$setUntouched();
        $scope.salesForm.currentProductModelNumber.$setUntouched();
        $scope.salesForm.currentProductSerialNumber.$setUntouched();
        $scope.salesForm.currentProductQuantity.$setUntouched();
        $scope.salesForm.currentProductPrice.$setUntouched();

        $scope.salesForm.currentProductName.$setPristine();
        $scope.salesForm.currentProductModelNumber.$setPristine();
        $scope.salesForm.currentProductSerialNumber.$setPristine();
        $scope.salesForm.currentProductQuantity.$setPristine();
        $scope.salesForm.currentProductPrice.$setPristine();
    }
    
    $scope.isValidProductInfoforAdd = function(){
        var allowAddProduct = false;
        if(!$scope.salesForm.currentProductName.$invalid && !$scope.salesForm.currentProductQuantity.$invalid && !$scope.salesForm.currentProductPrice.$invalid){
            allowAddProduct = true;
        }
        return allowAddProduct;
    }
    $scope.isValidCustomerAdd = function(){
        var isValidCustomerForm = false;
        if(!$scope.salesForm.customerName.$invalid){
            isValidCustomerForm = true;
        }
        return isValidCustomerForm;
    }

    $scope.removeRow = function removeRow(row) {
        var index = $scope.selectedProducts.indexOf(row);
        if (index !== -1) {
            $scope.selectedProducts.splice(index, 1);
        }
        $scope.taxTypeTotal = calculateTaxTypeTotal();
        calculateTotal();
    }
    
    var calculateTaxTypeTotal = function(){
        var taxTypes = {},  taxType = '', taxTypeSum = 0;
        console.log($scope.selectedProducts);
        for(var i=0; i<$scope.selectedProducts.length; i++){
            taxType = $scope.selectedProducts[i].taxType;
           if(taxTypes[taxType] === undefined){
               taxTypes[taxType] = {taxType:taxType, taxRate:$scope.selectedProducts[i].taxRate, taxAmmount:$scope.selectedProducts[i].taxAmmount || 0};
           }else{
               taxTypes[taxType].taxAmmount += $scope.selectedProducts[i].taxAmmount;
           }
        }
        return taxTypes;
    }
    
    $scope.printPage = function(){
        var printContents = document.getElementById("invoice-modal-full-123").innerHTML;
        var popupWin = window.open("print.html", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400");        
        popupWin.window.onload = function() {
            popupWin.document.getElementById("masterContent").innerHTML = printContents;
            popupWin.window.print();
            popupWin.window.close();  
            //$scope.reloadSalesPage();
        }        
    }
    
    $scope.reloadSalesPage = function(){
        window.location.href = "index.html";
    }
    
    $scope.open = function (size) {
        var modalInstance;
        var modalScope = $scope.$new();
        modalScope.ok = function () {
                modalInstance.close(modalScope.selected);
        };
        modalScope.cancel = function () {
                modalInstance.dismiss('cancel');
        };      
        
        modalInstance = $modal.open({
          template: '<print-modal-directive></print-modal-directive>',
          size: size || 'lg',
          scope: modalScope
          }
        );

        modalInstance.result.then(function (selectedItem) {
          //$scope.selected = selectedItem;
        }, function (a,b,c) {
          $log.info('Modal dismissed at: ' + new Date());
        });
  };
    
}]);
