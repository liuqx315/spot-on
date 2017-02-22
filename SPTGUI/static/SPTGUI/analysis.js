;(function(window) {

    // From https://thinkster.io/angular-tabs-directive
    angular.module('app', ['flow', 'ngCookies'])
	.config(['$httpProvider', function($httpProvider) {
	    // Play nicely with the CSRF cookie. Here we set the CSRF cookie
	    // to the cookie sent by Django
	    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
	    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
	}])
	       
	.run(['$http', '$cookies', function($http, $cookies) {
	    // CSRF cookie initialization
	    // And here we properly populate it (cannot be done before)
	    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
	}])
    
	.service('getterService', ['$http', '$cookies', function($http) {
	    // This service handles $http requests to get the list for the datasets
	    this.getDatasets = function(callback) {
		return $http.get('./api/datasets/');
	    };

	    // Get some statistics on the uploaded and preprocessed datasets
	    this.getStatistics = function(callback) {
		return $http.get('./statistics/');
	    };	    

	    // Delete a dataset, provided its id (filename used for validation)
	    this.deleteDataset = function(database_id, filename) {
		return $http.post('./api/delete/',
				  {'id': database_id,
				   'filename': filename});
	    };

	    this.updateDataset = function(database_id, dataset) {
		return $http.post('./api/edit/',
				  {'id': database_id,
				   'dataset': dataset});
	    };

	    this.getPreprocessing = function(callback) {
		return $http.get('./api/preprocessing/');
	    };
	    
	}])
	.controller('UploadController', ['getterService', '$scope', '$cookies', '$interval', function(getterService, $scope, $cookies, $interval) {
	    // This is the controller for the upload part of the app

	    //
	    // ==== Let's first define some global variables (on the $scope).
	    //
	    $scope.currentlyUploading=false;
	    $scope.successfullyUploaded=0;
	    $scope.editingDataset=false;
	    $scope.editedDataset=null;
	    $scope.poolPreprocessing=false;
	    $scope.random = 0; // DEBUG
	    //$scope.statistics = null;
	    
	    $scope.uploadStart = function($flow){
		$flow.opts.headers =  {'X-CSRFToken' : $cookies.get("csrftoken")};
	    }; // Populate $flow with the CSRF cookie!
	    getterService.getDatasets().then(function(dataResponse) {
		$scope.datasets = dataResponse['data'];
		$scope.successfullyUploaded=dataResponse['data'].length;
	    }); // Populate the scope with the already uploaded datasets
	    getterService.getStatistics().then(function(dataResponse) {
		$scope.statistics = dataResponse['data'];
	    }); // Populate the scope with the already computed statistics

	    $scope.showingStatistics=false;
	    $scope.shownStatistics=null;
	    
	    
	    //
	    // ==== Handle the edition of the list of files
	    //
	    $scope.deleteDataset = function(dataset) {
		getterService.deleteDataset(dataset.id, dataset.filename)
		    .then(function(dataResponse) {
			getterService.getDatasets().then(function(dataResponse) {
			    $scope.datasets = dataResponse['data'];
			    $scope.successfullyUploaded=dataResponse['data'].length;
			}); // Update the datasets variable when deleting sth.
			getterService.getStatistics().then(function(dataResponse) {
			    $scope.statistics = dataResponse['data'];
			}); // Populate the scope with the already computed statistics
		    });
		if ($scope.showStatistics == dataset) {
		    $scope.shownStatistics = null;
		    $scope.showingStatistics = false;   
		}
	    }

	    $scope.editDataset = function(dataset) {
		$scope.editingDataset=true;
		$scope.editedDataset=angular.copy(dataset);
	    };

	    $scope.cancelEdit = function(dataset) {
		$scope.editedDataset = null;
		$scope.editingDataset= false;
	    };

	    $scope.saveEdit = function(dataset) {
		$scope.datasets  =_.map($scope.datasets, function(el) {
		    return (el.id===dataset.id) ? dataset : el;
		});
		// Finish by sending the updated entry to the server
		getterService.updateDataset(dataset.id, dataset)

		$scope.cancelEdit(dataset); // End edition
	    }

	    //
	    // ==== Logic of the statistics display
	    //
	    $scope.showDataset = function(dataset) {
		$scope.shownStatistics = dataset;
		$scope.showingStatistics = true;
	    };
	    
	    //
	    // ==== Upload (ng-flow) events
	    //
	    // (1) Fired when a file is added to the download list
	    $scope.$on('flow::fileAdded', function (event, $flow, flowFile) {
		$scope.currentlyUploading=true;
	    });

	    // (2) Fired when all downloads are complete
	    $scope.$on('flow::complete', function (event, $flow, flowFile) {
		$scope.currentlyUploading=false;
	    });

	    // (3) Fired when one download completes
	    $scope.$on('flow::fileSuccess', function (file, message, chunk) {
		getterService.getDatasets().then(function(dataResponse) {
		    $scope.datasets = dataResponse['data'];
		    $scope.successfullyUploaded=dataResponse['data'].length;
		    $scope.poolPreprocessing = true; // start the watcher.
		});
		getterService.getStatistics().then(function(dataResponse) {
		    $scope.statistics = dataResponse['data'];
		}); // Populate the scope with the already computed statistics
	    });

	    //
	    // ==== Server-side processing after the upload
	    //
	    $scope.preprocessingStartStop = function() {
		// A DEBUG function
		$scope.poolPreprocessing = !$scope.poolPreprocessing;
	    }
	    preprocessingWaiter = $interval(function() {
		// This loops forever, but might become inactive
		if ($scope.poolPreprocessing) {
		    getterService.getPreprocessing().then(function(dataResponse) {
			$scope.random = dataResponse['data'];
			// Deprecated code (that works)
			// $scope.datasets = _.map($scope.datasets, function(el) {
			//     // This is just to update the preprocessing status
			//     for (i in dataResponse['data']) {
			// 	da = dataResponse['data'][i]
			// 	if (el.id == da.id) {
			// 	    el.preanalysis_status = da.state;
			// 	}
			//     }
			//     return el;
			// });
			getterService.getDatasets().then(function(dataResponse) {
			    $scope.datasets = dataResponse['data'];
			    $scope.successfullyUploaded=dataResponse['data'].length;
			}); // Populate the scope with the already uploaded datasets
			getterService.getStatistics().then(function(dataResponse) {
			    $scope.statistics = dataResponse['data'];
			}); // Populate the scope with the already computed statistics
			// Check if all the dataset is "ok", if yes, switch the flag
			if (_.every(dataResponse['data'], function(el) {return el.state==='ok'})) {
			    $scope.poolPreprocessing = false;
			}
		    });
		}
		return(true)
	    }, 2000);

	}])
    	.controller('ModelingController', ['getterService', '$scope', '$cookies', '$interval', function(getterService, $scope, $cookies, $interval) {
	    // This is the controller for the modeling tab

	    // Initiate the window with what we have /!\ SHOULD GO INTO A WATCHER FOR THE TAB SWITCHING STUFF
	    getterService.getDatasets().then(function(dataResponse) {
		$scope.datasets = dataResponse['data'];
	    }); // Populate the scope with the already uploaded datasets
	    getterService.getStatistics().then(function(dataResponse) {
		$scope.statistics = dataResponse['data'];
	    }); // Populate the scope with the already computed statistics	    
	    //
	    // ==== CRUD modeling parameters
	    //
	    $scope.modelingParameters = {bin_size : 10,
					 random : 3,
					};
	    //$scope.saveParameters = function(modelingParameters) {
	    //$scope.modelingParameters = scope.modelingParameters
	    //};
	}])

	.directive('tab', function() {
	    // Simple logic to create a <tab> directive in angular/bootstrap
	    return {
		restrict: 'E',
		transclude: true,
		template: '<div role="tabpanel" ng-show="active" ng-transclude></div>',
		require: '^tabset',
		scope: {
		    heading: '@'
		},
		link: function(scope, elem, attr, tabsetCtrl) {
		    scope.active = false
		    tabsetCtrl.addTab(scope)
		}
	    }
	})    
	.directive('tabset', function() {
	    // A tabset is a group of tabs.
	    return {
		restrict: 'E',
		transclude: true,
		scope: { },
		templateUrl: '/static/SPTGUI/tabset.html',
		bindToController: true,
		controllerAs: 'tabset',
		controller: function() {
		    var self = this
		    self.tabs = []
		    self.addTab = function addTab(tab) {
			self.tabs.push(tab)
			
			if(self.tabs.length === 1) {
			    tab.active = true
			}
		    }
		    self.select = function(selectedTab) {
			angular.forEach(self.tabs, function(tab) {
			    if(tab.active && tab !== selectedTab) {
				tab.active = false;
			    }
			})
			
			selectedTab.active = true;
		    }
		}
	    }
	})
	.directive('tooltip', function(){
	    // To display tooltips :)
	    return {
		restrict: 'A',
		link: function(scope, element, attrs){
		    $(element).hover(function(){
			// on mouseenter
			$(element).tooltip('show');
		    }, function(){
			// on mouseleave
			$(element).tooltip('hide');
		    });
		}
	    };
	});
    
})(window);

