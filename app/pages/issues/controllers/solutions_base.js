'use strict';

angular.module('app')
  .controller('SolutionsBaseController', function ($rootScope, $scope, $api, $filter, $q) {
    $scope.initializing = true;

    $scope.my_solution = undefined;
    $scope.bounty_total = 0;

    $scope.issue.then(function(issue) {
      $scope.bounty_total = parseInt(issue.bounty_total, 10);

      // If the person is logged in, attempt to find their developer goal
      $scope.my_solution = $api.solution_get(issue.id).then(function(my_solution) {
        $scope.initializing = false;

        $scope.set_status_for_solution(my_solution);

        return my_solution;
      });

      // Decalre that the logged in person is working on a solution
      $scope.start_solution = function () {
        $api.start_solution(issue.id).then(function(new_solution) {
          $scope.$emit('solutionCreatePushed', new_solution);
        });
      };

      // Restart a solution that the logged in user said they stopped working on
      $scope.restart_solution = function () {
        $scope.my_solution.then(function() {
          $api.restart_solution(issue.id).then(function(updated_solution) {
            $scope.$emit('solutionUpdatePushed', updated_solution);
          });
        });
      };

      // Stop working on a solution that the logged in user started
      $scope.stop_solution = function () {
        $scope.my_solution.then(function() {
          $api.stop_solution(issue.id).then(function(updated_solution) {
            $scope.$emit('solutionUpdatePushed', updated_solution);
          });
        });
      };

      // Declare that the logged in person is continuing to work on their solution
      $scope.checkin_solution = function () {
        $scope.my_solution.then(function() {
          $api.checkin_solution(issue.id).then(function(updated_solution) {
            $scope.$emit('solutionUpdatePushed', updated_solution);
          });
        });
      };

      // Declare that the logged in person is finished working on their solution
      $scope.complete_solution = function () {
        $scope.my_solution.then(function() {
          $api.complete_solution(issue.id).then(function(updated_solution) {
            $scope.$emit('solutionUpdatePushed', updated_solution);
          });
        });
      };

      return issue;
    });

    $scope.$on('solutionCreateReceived', function(event, new_solution) {
      var deferred = $q.defer();
      deferred.resolve(new_solution);
      $scope.my_solution = deferred.promise;
      $scope.set_status_for_solution(new_solution);
    });

    $scope.$on('solutionUpdateReceived', function(event, updated_solution) {
      if (updated_solution) {
        for (var k in updated_solution) {
          $scope.my_solution[k] = updated_solution[k];
        }
        $scope.set_status_for_solution(updated_solution);
      }
    });

    // Get the last event for a given solution
    $scope.set_status_for_solution = function(solution) {
      if (solution && solution.solution_events) {
        $scope.status = $filter('orderBy')(solution.solution_events, ["-created_at"])[0];
      }
    };
  });
