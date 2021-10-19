function init() {
  console.log("init");
  var width = window.innerWidth;
  var height = width / 1.333333333;
  document.querySelector("#affdex_elements").setAttribute("width", width);
  document.querySelector("#affdex_elements").setAttribute("height", height);
  document.querySelector("#face_dots").setAttribute("width", width);
  document.querySelector("#face_dots").setAttribute("height", height);

  $("#start").click(function () {
    onStart();
  });

  $("#stop").click(function () {
    onStop();
  });

  $("#reset").click(function () {
    onReset();
  });

  $("#pause").click(function () {
    onPause();
  });

  $("#toggle").click(function () {
    $("#affdex_elements").toggle();
  });

  //function executes when Start button is pushed.
  function onStart() {
    if (detector && !detector.isRunning) {
      detector.start();
    }
  }

  //function executes when the Stop button is pushed.
  function onStop() {
    if (detector && detector.isRunning) {
      detector.removeEventListener();
      detector.stop();
    }
  }

  //function executes when the Reset button is pushed.
  function onReset() {
    if (detector && detector.isRunning) {
      detector.reset();
    }
  }

  function onPause() {
    if (detector && detector.isRunning && notPaused) {
      notPaused = false;
    } else {
      notPaused = true;
    }
  }

  // SDK Needs to create video and canvas nodes in the DOM in order to function
  // Here we are adding those nodes a predefined div.
  var divRoot = document.querySelector("#affdex_elements");
  var notPaused = true;

  var faceMode = affdex.FaceDetectorMode.SMALL_FACES;
  //Construct a CameraDetector and specify the image width / height and face detector mode.
  var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

  $(window).resize(function () {
    console.log("onResize");
    width = window.innerWidth;
    height = width / 1.333333333;
    document.querySelector("#affdex_elements").setAttribute("width", width);
    document.querySelector("#affdex_elements").setAttribute("height", height);
    document.querySelector("#face_dots").setAttribute("width", width);
    document.querySelector("#face_dots").setAttribute("height", height);
    detector = new affdex.CameraDetector(divRoot, width, height, faceMode);
  });

  // Enable detection only of Appearance classifiers.
  // detector.detectAllEmotions();
  // detector.detectAllExpressions();
  // detector.detectAllEmojis();
  detector.detectAllAppearance();

  //Add a callback to notify when the detector is initialized and ready for runing.
  detector.addEventListener("onInitializeSuccess", function () {});
  //Add a callback to notify when camera access is allowed
  detector.addEventListener("onWebcamConnectSuccess", function () {});
  //Add a callback to notify when camera access is denied
  detector.addEventListener("onWebcamConnectFailure", function () {
    alert("Webcam access denied, please allow webcam access for the program to run");
  });
  //Add a callback to notify when detector is stopped
  detector.addEventListener("onStopSuccess", function () {});

  detector.addEventListener(
    "onImageResultsSuccess",
    function (faces, image, timestamp) {
      // Render loop
      if (faces.length > 0) {
        $("#gender").html(JSON.stringify(faces[0].appearance.gender));
        drawFeaturePoints(faces, image, faces[0].featurePoints);
      }
    }
  );

  //Draw the detected facial feature points on the image
  let oldFeaturePoints = []
  function rounded(key, coord) {
    return Math.round(oldFeaturePoints.map(points => {
      return Math.round(points[key][coord])
    }).reduce(function(sum, a) { return sum + a },0)/(oldFeaturePoints.length||1))
  }

  function featurePointsDeviation() {
    const standardDeviation = (arr, usePopulation = false) => {
      const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
      return Math.sqrt(
        arr.reduce((acc, val) => acc.concat((val - mean) ** 2), []).reduce((acc, val) => acc + val, 0) /
          (arr.length - (usePopulation ? 0 : 1))
      );
    }

    const pointsArrayX = Math.round(standardDeviation(oldFeaturePoints.map(points => {
      return Math.round(points[0]["x"])
    })))

    const pointsArrayY = Math.round(standardDeviation(oldFeaturePoints.map(points => {
      return Math.round(points[0]["y"])
    })))
    return pointsArrayX > pointsArrayY ? pointsArrayX : pointsArrayX
  }


  function drawFeaturePoints(faces, img, featurePoints) {
    // store last 5 feature points so we can average them
    oldFeaturePoints.push(featurePoints)
    if (oldFeaturePoints.length > 1) {
      let deviation = featurePointsDeviation()
      if (deviation > 6) {
        oldFeaturePoints = [featurePoints]
      } else if (oldFeaturePoints.length > 7) {
        oldFeaturePoints.shift()
      }
    }


    let el = $("#face_dots")[0];
    let contxt = el.getContext("2d");

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
      const x = rounded(0, "x")
      const y = rounded(0, "y")

      contxt.fillStyle = "rgba(105,176,219,0.40)";
      contxt.fillRect(
        x - 40,
        y + 10,
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
        x - 50,
        y
      );
      contxt.fillText(
        age.toUpperCase(),
        x - 50,
        y - 20
      );
      contxt.fillText(
        race.toUpperCase(),
        x - 50,
        y - 40
      );

      // points
      contxt.fillStyle = "#FFFFFF";
      for (var id in featurePoints) {
        const idX = rounded(id, "x")
        const idY = rounded(id, "y")
        contxt.fillRect(
          idX,
          idY,
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
    mediaRecorder.start();
    $("#recording_status").html("recording")
  });

  $("#recording_stop").click(function () {
    mediaRecorder.stop();
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


  onStart()
}

$(window).ready(() => {
  init()
});
