// SDK Needs to create video and canvas nodes in the DOM in order to function
// Here we are adding those nodes a predefined div.
var divRoot = $("#affdex_elements")[0];
// var width = 640;
// var height = 480;

var width = 1280;
var height = 960;


// var height = document.documentElement.offsetHeight;
// var width = height*1.333333333;

var faceMode = affdex.FaceDetectorMode.SMALL_FACES;
//Construct a CameraDetector and specify the image width / height and face detector mode.
var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

//Enable detection of all Expressions, Emotions and Emojis classifiers.
// detector.detectAllEmotions();
// detector.detectAllExpressions();
// detector.detectAllEmojis();
detector.detectAllAppearance();

//Add a callback to notify when the detector is initialized and ready for runing.
detector.addEventListener("onInitializeSuccess", function() {
  log('#logs', "The detector reports initialized");
  //Display canvas instead of video feed because we want to draw the feature points on it
  $("#face_video_canvas").css("display", "block");
  $("#face_video").css("display", "none");
});

function log(node_name, msg) {
  $(node_name).append("<span>" + msg + "</span><br />")
}

//function executes when Start button is pushed.
function onStart() {
  if (detector && !detector.isRunning) {
    $("#logs").html("");
    detector.start();
  }
  log('#logs', "Clicked the start button");
}

$(window).ready(function () {
  onStart();
})
//function executes when the Stop button is pushed.
function onStop() {
  log('#logs', "Clicked the stop button");
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    detector.stop();
  }
};

//function executes when the Reset button is pushed.
function onReset() {
  log('#logs', "Clicked the reset button");
  if (detector && detector.isRunning) {
    detector.reset();

    $('#results').html("");
  }
};

//Add a callback to notify when camera access is allowed
detector.addEventListener("onWebcamConnectSuccess", function() {
  log('#logs', "Webcam access allowed");
});

//Add a callback to notify when camera access is denied
detector.addEventListener("onWebcamConnectFailure", function() {
  log('#logs', "webcam denied");
  console.log("Webcam access denied");
});

//Add a callback to notify when detector is stopped
detector.addEventListener("onStopSuccess", function() {
  log('#logs', "The detector reports stopped");
  $("#results").html("");
});

//Add a callback to receive the results from processing an image.
//The faces object contains the list of the faces detected in an image.
//Faces object contains probabilities for all the different expressions, emotions and appearance metrics
// detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
//   $('#results').html("");
//   log('#results', "Timestamp: " + timestamp.toFixed(2));
//   log('#results', "Number of faces found: " + faces.length);
//   if (faces.length > 0) {
//     log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
//     log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
//       return val.toFixed ? Number(val.toFixed(0)) : val;
//     }));
//     log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
//       return val.toFixed ? Number(val.toFixed(0)) : val;
//     }));
//     log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);
//     drawFeaturePoints(image, faces[0].featurePoints);
//   }
// });

detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
  $('#results').html("");
  if (faces.length > 0) {
    $('#gender').html(JSON.stringify(faces[0].appearance.gender));
    drawFeaturePoints(faces, image, faces[0].featurePoints);
  }
});

//Draw the detected facial feature points on the image
function drawFeaturePoints(faces, img, featurePoints) {
  var contxt = $('#face_video_canvas')[0].getContext('2d');

  var hRatio = contxt.canvas.width / img.width;
  var vRatio = contxt.canvas.height / img.height;
  var ratio = Math.min(hRatio, vRatio);



  contxt.lineWidth=1;

  var race = "Race: " + faces[0].appearance.ethnicity;
  var age = "Age: " + faces[0].appearance.age;
  var sex = "Sex: " + faces[0].appearance.gender;

  var arr = [race, age, sex];

  var longest = arr.reduce(function (a, b) { return a.length > b.length ? a : b; });
  console.log(longest.length);

// background
  contxt.fillStyle="rgba(105,176,219,0.40)";
  contxt.fillRect(featurePoints[0].x-40,featurePoints[0].y+10, -(longest.length*10), -70);

// text
  contxt.font="16px sans-serif";
  contxt.textAlign = 'right';
  contxt.strokeStyle = "#FFF";
  contxt.fillStyle = "#FFF";
  contxt.fillText(sex, featurePoints[0].x-50, featurePoints[0].y);
  contxt.fillText(age, featurePoints[0].x-50, featurePoints[0].y-20);
  contxt.fillText(race, featurePoints[0].x-50, featurePoints[0].y-40);

  // contxt.beginPath();
  // contxt.arc(featurePoints[15].x-60, featurePoints[15].y, 300, 0, 300 * Math.PI);
  // contxt.lineWidth = 2;
  // contxt.stroke();

// points
  contxt.fillStyle = "#FFFFFF";
  for (var id in featurePoints) {
    contxt.beginPath();
    contxt.arc(featurePoints[id].x,
      featurePoints[id].y, 2, 0, 2 * Math.PI);
    contxt.fill();

  }
}
