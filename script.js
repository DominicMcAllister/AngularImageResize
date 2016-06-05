// Code goes here

(function () {
    var app = angular.module('testApp', []);

    app.controller('AppController', function AppController($scope, $document, $q, fileReader) {

        $scope.isProcessing = false;

        $scope.processImage = function (imageData) {
            var deferred = $q.defer();

            //load the image into memory.
            var image = new Image();
            image.src = imageData;

            image.onload = function () {
                $scope.imageWidth = this.width;
                $scope.imageHeight = this.height;

                //check the ratio of the object.
                var ratio = this.width / this.height;
                if (ratio != 2) {
                    var newWidth = 0;
                    var newHeight = 0;
                    var fromTop = 0;
                    var fromLeft = 0;

                    //make the new dimension 2 x 1
                    if (this.width > this.height) {

                        //determine which direction to double to make an full 2x1 image without cutoff
                        if (this.width / 2 >= this.height) {
                            newWidth = this.width;
                            newHeight = this.width / 2;
                        }
                        else {
                            newWidth = this.height * 2;
                            newHeight = this.height;
                        }
                    }
                    else {
                        newHeight = this.height;
                        newWidth = this.height * 2;
                    }

                    //center the image width wise -- make sure not to cut off the image
                    fromTop = (newHeight - this.height) / 2;
                    var centerRounded = Math.round(fromTop);
                    if (fromTop != centerRounded) {
                        fromTop = centerRounded - 1;
                    }

                    //center the image width wise -- make sure not to cut off the image
                    fromLeft = (newWidth - this.width) / 2;
                    var centerRounded = Math.round(fromLeft);
                    if (fromLeft != centerRounded) {
                        fromLeft = centerRounded - 1;
                    }

                    //use an HTML5 canvas to expand the scope of the image.
                    var canvas = document.createElement('canvas');
                    canvas.width = newWidth;
                    canvas.height = newHeight;

                    //fill the image with magenta so we can see what changed.
                    var canvasContext = canvas.getContext('2d');
                    canvasContext.beginPath();
                    canvasContext.rect(0, 0, newWidth, newHeight);
                    canvasContext.fillStyle = "Magenta";
                    canvasContext.fill();
                    canvasContext.drawImage(image, fromLeft, fromTop, this.width, this.height);

                    var obj = {
                        originalWidth: this.width,
                        originalHeight: this.height,
                        newWidth: newWidth,
                        newHeight: newHeight,
                        newImageData: canvas.toDataURL('image/jpeg')
                    };
                    deferred.resolve(obj);
                }
                //the image does not need resizing.
                else {
                    var obj = { originalHeight: this.height, originalWidth: this.width, newImageData: imageData, newWidth: this.width, newHeight: this.height };
                    deferred.resolve(obj);
                }
            };

            return deferred.promise;
        };

        $scope.getFile = function () {
            $scope.isProcessing = true;

            fileReader.readAsDataUrl($scope.file, $scope, $document)
                          .then(function (result) {
                              $scope.imageSrc = result;

                              //process the image.
                              $scope.processImage(result).then(function (processed) {
                                  $scope.imageWidth = processed.originalWidth;
                                  $scope.imageHeight = processed.originalHeight;
                                  $scope.resizedSrc = processed.newImageData;
                                  $scope.newWidth = processed.newWidth;
                                  $scope.newHeight = processed.newHeight;
                              },
                              function (error) {
                                  var test = 1;
                              }).finally(function () {
                                  $scope.isProcessing = false;
                              });
                          });
        };

    });
}
)();

(function () {
    var app = angular.module('testApp');

    app.directive("onFileSelect", function () {
        return {
            link: function ($scope, el) {
                el.bind("change", function (e) {
                    $scope.file = (e.srcElement || e.target).files[0];
                    $scope.getFile();
                })
            }
        }
    })
})();