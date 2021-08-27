// console.log(window.navigator)
// console.log(window.navigator.mediaDevices);
// console.log(navigator.mediaDevices);
// tauri fails with this
// window.notification.requestPermission()
//   .then(response => {
//     if (response === 'granted') {
//       new Notification('title', { body: 'some text' })
//     }
//   })

$(window).ready(function() {
  console.log('ready')

  $('#start').click(function() {
    onStart();
    console.log('click')
  })

  $('#stop').click(function() {
    onStop();
    console.log('click')
  })

  $('#reset').click(function() {
    onReset();
    console.log('click')
  })

  $('#pause').click(function() {
    onPause();
    console.log('click')
  })

  $('#toggle').click(function() {
    $('#affdex_elements').toggle()
  })

// SDK Needs to create video and canvas nodes in the DOM in order to function
// Here we are adding those nodes a predefined div.
var divRoot = document.querySelector("#affdex_elements")
// var width = 640;
// var height = 480;
var notPaused = true;
var width = 1280;
var height = 960;


console.log(divRoot);

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



function onPause() {
  if (detector && detector.isRunning && notPaused) {
    notPaused = false;
  } else {
    notPaused = true;
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
    drawFeaturePoints($('#face_dots')[0], faces, image, faces[0].featurePoints);
  }
});

//Draw the detected facial feature points on the image
function drawFeaturePoints(el, faces, img, featurePoints) {
  const PointSettings = {
    size: 3,
    fill: '#FFF'
  }

  var contxt = el.getContext('2d');
  contxt.clearRect(0,0, width, height);
  // contxt.fillStyle="transparent";
  // contxt.fillRect(0, 0, contxt.canvas.width, contxt.canvas.height);

  var hRatio = contxt.canvas.width / img.width;
  var vRatio = contxt.canvas.height / img.height;
  var ratio = Math.min(hRatio, vRatio);



  contxt.lineWidth=1;

  var race = "RACE: " + faces[0].appearance.ethnicity;
  var age = "AGE: " + faces[0].appearance.age;
  var sex = "SEX: " + faces[0].appearance.gender;

  var arr = [race, age, sex];

  var longest = arr.reduce(function (a, b) { return a.length > b.length ? a : b; });
  // console.log(longest.length);

// background


  if (notPaused) {
    contxt.fillStyle="rgba(105,176,219,0.40)";
    contxt.fillRect(featurePoints[0].x-40,featurePoints[0].y+10, -(longest.length*11), -70);

    // text
    contxt.font="16px Menlo";
    contxt.textAlign = 'right';
    contxt.strokeStyle = "#FFF";
    contxt.fillStyle = "#FFF";

    contxt.fillText(sex.toUpperCase(), featurePoints[0].x-50, featurePoints[0].y);
    contxt.fillText(age.toUpperCase(), featurePoints[0].x-50, featurePoints[0].y-20);
    contxt.fillText(race.toUpperCase(), featurePoints[0].x-50, featurePoints[0].y-40);

    // points
      contxt.fillStyle = "#FFFFFF";
      for (var id in featurePoints) {
        contxt.fillRect(featurePoints[id].x,
          featurePoints[id].y, PointSettings.size, PointSettings.size);

      }
    } else {
      // remove from canvas
      contxt.clearRect(0,0, width, height);
    }

  }


  // contxt.beginPath();
  // contxt.arc(featurePoints[15].x-60, featurePoints[15].y, 300, 0, 300 * Math.PI);
  // contxt.lineWidth = 2;
  // contxt.stroke();


// //Draw the detected facial feature points on the image
// function drawFeaturePoints(featurePoints) {
//   $('#box').css('top', featurePoints[0].y - 120);
//   $('#box').css('left', featurePoints[0].x - 200);
//
//
//   if ($('#face_dots').hasClass('dots')) {
//     var dot = document.getElementsByClassName('dot');
//     for (var id in featurePoints) {
//       dot[id].style.left = featurePoints[id].x + 'px';
//       dot[id].style.top = featurePoints[id].y + 'px';
//     }
//   } else {
//     console.log('false');
//     $('#face_dots').addClass('dots');
//
//     for (var id in featurePoints) {
//       var div = document.createElement("div");
//       div.setAttribute("class", "dot");
//       div.setAttribute("id", "dot"+id);
//       document.getElementById("face_dots").appendChild(div);
//
//       div.style.position = "fixed";
//       div.style.left = featurePoints[id].x+'px';
//       div.style.top = featurePoints[id].y+'px';
//     }
//   }
// }



})
