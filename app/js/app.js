'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/states-review', {templateUrl: 'partials/states-review.html', controller: 'statesReviewController'});
  $routeProvider.when('/states-quiz', {templateUrl: 'partials/states-quiz.html', controller: 'statesQuizController'});
  $routeProvider.otherwise({redirectTo: '/states-review'});
}]);


