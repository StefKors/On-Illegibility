$(window).resize(function () {
  // location.reload();
});

$(window).ready(function () {
  // var width = window.innerWidth;
  var width = window.innerWidth;
  var height = width / 1.333333333;
  // document.querySelector("#face_video")?.setAttribute("width", width)
  // document.querySelector("#face_video")?.setAttribute("height", height)
  document.querySelector("#affdex_elements").setAttribute("width", width);
  document.querySelector("#affdex_elements").setAttribute("height", height);
  document.querySelector("#face_dots").setAttribute("width", width);
  document.querySelector("#face_dots").setAttribute("height", height);
  let el = $("#face_dots")[0];
  let contxt = el.getContext("2d");
  console.log("ready");

  $("#start").click(function () {
    onStart();
    console.log("click");
  });

  $("#stop").click(function () {
    onStop();
    console.log("click");
  });

  $("#reset").click(function () {
    onReset();
    console.log("click");
  });

  $("#pause").click(function () {
    onPause();
    console.log("click");
  });

  $("#toggle").click(function () {
    $("#affdex_elements").toggle();
  });

  // SDK Needs to create video and canvas nodes in the DOM in order to function
  // Here we are adding those nodes a predefined div.
  var divRoot = document.querySelector("#affdex_elements");
  // var width = 640;
  // var height = 480;
  var notPaused = true;
  // var width = window.innerWidth;
  // var height = window.innerHeight;

  var faceMode = affdex.FaceDetectorMode.SMALL_FACES;
  //Construct a CameraDetector and specify the image width / height and face detector mode.
  var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

  $(window).resize(function () {
    console.log("onResize");
    width = window.innerWidth;
    height = width / 1.333333333;
    // document.querySelector("#face_video")?.setAttribute("width", width)
    // document.querySelector("#face_video")?.setAttribute("height", height)
    document.querySelector("#affdex_elements").setAttribute("width", width);
    document.querySelector("#affdex_elements").setAttribute("height", height);
    document.querySelector("#face_dots").setAttribute("width", width);
    document.querySelector("#face_dots").setAttribute("height", height);
    // detector = new affdex.CameraDetector(divRoot, width, height, faceMode);
  });

  //Enable detection of all Expressions, Emotions and Emojis classifiers.
  // detector.detectAllEmotions();
  // detector.detectAllExpressions();
  // detector.detectAllEmojis();
  detector.detectAllAppearance();

  //Add a callback to notify when the detector is initialized and ready for runing.
  detector.addEventListener("onInitializeSuccess", function () {
    log("#logs", "The detector reports initialized");
    //Display canvas instead of video feed because we want to draw the feature points on it
    $("#face_video_canvas").css("display", "block");
    $("#face_video").css("display", "none");
  });

  function log(node_name, msg) {
    $(node_name).append("<span>" + msg + "</span><br />");
  }

  //function executes when Start button is pushed.
  function onStart() {
    if (detector && !detector.isRunning) {
      $("#logs").html("");
      detector.start();
    }
    log("#logs", "Clicked the start button");
  }

  $(window).ready(function () {
    onStart();
  });
  //function executes when the Stop button is pushed.
  function onStop() {
    log("#logs", "Clicked the stop button");
    if (detector && detector.isRunning) {
      detector.removeEventListener();
      detector.stop();
    }
  }

  //function executes when the Reset button is pushed.
  function onReset() {
    log("#logs", "Clicked the reset button");
    if (detector && detector.isRunning) {
      detector.reset();

      $("#results").html("");
    }
  }

  function onPause() {
    if (detector && detector.isRunning && notPaused) {
      notPaused = false;
    } else {
      notPaused = true;
    }
  }

  //Add a callback to notify when camera access is allowed
  detector.addEventListener("onWebcamConnectSuccess", function () {
    log("#logs", "Webcam access allowed");
  });

  //Add a callback to notify when camera access is denied
  detector.addEventListener("onWebcamConnectFailure", function () {
    log("#logs", "webcam denied");
    console.log("Webcam access denied");
  });

  //Add a callback to notify when detector is stopped
  detector.addEventListener("onStopSuccess", function () {
    log("#logs", "The detector reports stopped");
    $("#results").html("");
  });

  detector.addEventListener(
    "onImageResultsSuccess",
    function (faces, image, timestamp) {
      // Render loop
      $("#results").html("");
      if (faces.length > 0) {
        $("#gender").html(JSON.stringify(faces[0].appearance.gender));
        drawFeaturePoints(faces, image, faces[0].featurePoints);
      }
    }
  );

  //Draw the detected facial feature points on the image
  function drawFeaturePoints(faces, img, featurePoints) {
    const PointSettings = {
      size: 3,
      fill: "#FFF",
    };

    contxt.clearRect(0, 0, width, height);
    contxt.fillStyle = "transparent";
    contxt.fillRect(0, 0, width, height);
    contxt.lineWidth = 1;
    var race = "RACE: " + faces[0].appearance.ethnicity;
    var age = "AGE: " + faces[0].appearance.age;
    var sex = "SEX: " + faces[0].appearance.gender;

    var arr = [race, age, sex];

    var longest = arr.reduce(function (a, b) {
      return a.length > b.length ? a : b;
    });

    if (notPaused) {
      contxt.fillStyle = "rgba(105,176,219,0.40)";
      contxt.fillRect(
        Math.round(featurePoints[0].x - 40),
        Math.round(featurePoints[0].y + 10),
        -(longest.length * 11),
        -70
      );

      // text
      contxt.font = "16px Menlo";
      contxt.textAlign = "right";
      contxt.strokeStyle = "#FFF";
      contxt.fillStyle = "#FFF";

      contxt.fillText(
        sex.toUpperCase(),
        Math.round(featurePoints[0].x - 50),
        Math.round(featurePoints[0].y)
      );
      contxt.fillText(
        age.toUpperCase(),
        Math.round(featurePoints[0].x - 50),
        Math.round(featurePoints[0].y - 20)
      );
      contxt.fillText(
        race.toUpperCase(),
        Math.round(featurePoints[0].x - 50),
        Math.round(featurePoints[0].y - 40)
      );

      // points
      contxt.fillStyle = "#FFFFFF";
      for (var id in featurePoints) {
        contxt.fillRect(
          Math.round(featurePoints[id].x),
          Math.round(featurePoints[id].y),
          PointSettings.size,
          PointSettings.size
        );
      }
    } else {
      // remove from canvas
      contxt.clearRect(0, 0, width, height);
    }
  }

  // Optional frames per second argument.
  var stream = document.querySelector("#face_dots").captureStream(25);
  var recordedChunks = [];
  var options = {
    mimeType: "video/webm;codecs:h.264",
  };
  mediaRecorder = new MediaRecorder(stream, options);

  $("#recording_start").click(function () {
    console.log("click");
    mediaRecorder.start();
    $("#recording_status").html("recording")
  });

  $("#recording_stop").click(function () {
    mediaRecorder.stop();
    console.log("click");
    $("#recording_status").html("stopped")
  });

  mediaRecorder.ondataavailable = handleDataAvailable;

  function handleDataAvailable(event) {
    console.log("data-available");
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
      console.log(recordedChunks);
      download();
    } else {
      // ...
    }
  }
  function download() {
    var blob = new Blob(recordedChunks, {
      type: "video/webm",
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = `recording-${new Date().getTime()}.webm`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
});
