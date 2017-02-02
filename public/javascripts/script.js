var app = angular.module("galleryManager", []);
app.controller("myCtrl", function($scope, $http) {
	$scope.message = "Kristen's World of Color - Manager";
	$scope.authError = "";
	$scope.rowEdit = false;
	$scope.type = 'canvas';
	$http.get("/content/data.json").then(function(response) {
		$scope.data = response.data;
	})

	setTimeout(addSortable, 1000);

	$scope.setType = function(type) {
		$scope.type = type;
		setTimeout(addSortable, 500);
	}

	$scope.editTitle = function(columnIndex, $event) {
		var obj = $event.target;
		var rowIndex = parseInt(obj.parentNode.parentNode.id.substring(9));
		var input = document.createElement('input');
		input.id = "titleInput";
		input.value = obj.innerHTML;
		obj.style.display = "none";
		obj.parentNode.insertBefore(input, obj.nextSibling);
		input.focus();

		input.onblur = function() { 
			$scope.data[$scope.type][rowIndex][columnIndex].title = input.value;
			obj.style.display = "block";
			input.remove();
			$scope.$apply();
		};
	};	

	$scope.decreaseSize = function(columnIndex, $event) {
		var obj = $event.target;
		var rowIndex = parseInt(obj.parentNode.parentNode.parentNode.parentNode.id.substring(9));
		$scope.data[$scope.type][rowIndex][columnIndex].columns = $scope.data[$scope.type][rowIndex][columnIndex].columns - 1;
	}

	$scope.increaseSize = function(columnIndex, $event) {
		var obj = $event.target;
		var rowIndex = parseInt(obj.parentNode.parentNode.parentNode.parentNode.id.substring(9));
		$scope.data[$scope.type][rowIndex][columnIndex].columns = $scope.data[$scope.type][rowIndex][columnIndex].columns + 1;
	}

	$scope.moveLeft = function(columnIndex, $event) {
		var obj = $event.target;
		var rowIndex = parseInt(obj.parentNode.parentNode.parentNode.parentNode.id.substring(9));
		var offset = $scope.data[$scope.type][rowIndex][columnIndex].offset;
		if (offset !== 0) {
			$scope.data[$scope.type][rowIndex][columnIndex].offset = offset - 1;
		} 
	}

	$scope.moveRight = function(columnIndex, $event) {
		var obj = $event.target;
		var rowIndex = parseInt(obj.parentNode.parentNode.parentNode.parentNode.id.substring(9));
		var offset = $scope.data[$scope.type][rowIndex][columnIndex].offset;
		if (isNaN(offset)) {
			offset = 0;
		}
		if (offset !== 12) {
			$scope.data[$scope.type][rowIndex][columnIndex].offset = offset + 1;
		} 
	}

	$scope.delete = function(columnIndex, $event) {
		var obj = $event.target;
		var rowIndex = parseInt(obj.parentNode.parentNode.parentNode.parentNode.id.substring(9));
		$scope.data[$scope.type][rowIndex].splice(columnIndex, 1)[0];
	}

	$scope.openModal = function() {
		jQuery(".modal").css("display", "block");
	}

	$scope.editRows = function() {
		$scope.rowEdit = !$scope.rowEdit;
	}

	$scope.deleteRow = function($event) {
		var obj = $event.target;
		var rowIndex= parseInt(obj.parentNode.parentNode.id.substring(9));
		$scope.data[$scope.type].splice(rowIndex, 1)[0];
	}

	$scope.insertRowAbove = function($event) {
		var newRow = [];
		var obj = $event.target;
		var rowIndex = parseInt(obj.parentNode.parentNode.parentNode.id.substring(9));
		$scope.data[$scope.type].splice(rowIndex, 0, newRow);
	}

	$scope.insertRowBelow = function($event) {
		var newRow = [];
		var obj = $event.target;
		var rowIndex= parseInt(obj.parentNode.parentNode.parentNode.id.substring(9));
		console.log(rowIndex);
		$scope.data[$scope.type].splice(rowIndex+1, 0, newRow);
	}

	$scope.swapRowAbove = function($event) {
		var obj = $event.target;
		var rowIndex = parseInt(obj.parentNode.parentNode.parentNode.id.substring(9));
		if (rowIndex !== 0) {
			var temp = $scope.data[$scope.type][rowIndex];
			$scope.data[$scope.type][rowIndex] = $scope.data[$scope.type][rowIndex-1];
			$scope.data[$scope.type][rowIndex-1] = temp;
		}
	}

	$scope.swapRowBelow = function($event) {
		var obj = $event.target;
		var rowIndex = parseInt(obj.parentNode.parentNode.parentNode.id.substring(9));
		if (rowIndex !== $scope.data[$scope.type].length-1) {
			var temp = $scope.data[$scope.type][rowIndex];
			$scope.data[$scope.type][rowIndex] = $scope.data[$scope.type][rowIndex+1];
			$scope.data[$scope.type][rowIndex+1] = temp;
		}
	}

	$scope.save = function() {
		var password = jQuery("#password").val();
		var postData = {"password": password, "content": $scope.data};
		jQuery.ajax({	
	     	url: '/save',
	     	type: 'POST',
	     	data: JSON.stringify(postData),
            contentType: "application/json; charset=utf-8",
	     	success: function(data){
	        	jQuery(".modal").css("display", "none");
	        	$scope.message = "Save Successful";
	        	$scope.$apply();
	        	setTimeout(function() {
	        		$scope.message = "Kristen's World of Color - Manager";
	        		$scope.$apply();
	        	}, 3000);
	      	},
	      	error: function(data) {
	      		$scope.authError = data.responseText + ', Please try again.';
	      		$scope.$apply();
	      	}
	      });
	}

	$scope.cancelSave = function() {
		jQuery(".modal").css("display", "none");
	}

	jQuery('.upload-btn').on('click', function (){
	    jQuery('#upload-input').click();
	    jQuery('.progress-bar').text('0%');
	    jQuery('.progress-bar').width('0%');
	});

	jQuery('#upload-input').on('change', function(){
		var files = $(this).get(0).files;

	    if (files.length > 0) {
	    	// create a FormData object which will be sent as the data payload in the
	    	// AJAX request
		    var formData = new FormData();

		    // add file to the formData object
		    var file = files[0];
		    formData.append('uploads[]', file, file.name);

		    jQuery.ajax({
		     	url: '/upload',
		     	type: 'POST',
		     	headers: {'type': $scope.type},
		     	data: formData,
		     	processData: false,
		     	contentType: false,
		     	success: function(data){
		        	// Create new row/file for json data with some default values, and then add to beginning of appropriate type
		       		var fileData = [{
		      			"fileName": file.name,
        				"title": "New",
        				"columns": 6,
        				"offset": 3
        			}];
		      		$scope.data[$scope.type].splice(0, 0, fileData);
		      		$scope.$apply();
		      		addSortable();
		      	}
		    });
		}
	});

	function addSortable() {
		var rows = $scope.data[$scope.type].length;
		var ids = "";
		for (var i = 0; i < rows-1; i++) {
			ids += "#sortable-" + i + ", ";
		}
		ids += "#sortable-" + (rows-1);
		jQuery(ids).sortable({
            connectWith: ".connected",
            cancel: ".rowCommands",
            start: function(event, ui) {
        		ui.item.startPos = ui.item.index();
        		ui.item.startRow = parseInt(ui.item.parent().attr('id').substring(9));
        		ui.placeholder.height(ui.item.height());
        		ui.placeholder.css('visibility', 'visible');
        		ui.placeholder.css('background-color', '#ffffcc');
    		},
            stop: function(event, ui) {
            	var startPos = ui.item.startPos;
            	var startRow = ui.item.startRow;
            	var endPos = ui.item.index();
            	var endRow = ui.item.parent().attr('id').substring(9);
            	var piece = $scope.data[$scope.type][startRow].splice(startPos, 1)[0];
            	if (endPos === $scope.data[$scope.type][endRow].length) {
            		$scope.data[$scope.type][endRow].splice(0, 0, piece);
            		$scope.$apply();
            		$scope.data[$scope.type][endRow].splice(0, 1);
            		$scope.data[$scope.type][endRow].splice(endPos, 0, piece);
            	} else {
            		$scope.data[$scope.type][endRow].splice(endPos, 0, piece);
            	}
            	$scope.$apply();
            }
        }).disableSelection();
	}
})


