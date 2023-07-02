import { CGFapplication, CGFshader } from '../lib/CGF.js';
import { XMLscene } from './XMLscene.js';
import { MyInterface } from './MyInterface.js';
import { MySceneGraph } from './MySceneGraph.js';
import { MyGameController } from './MyGameController.js';

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[decodeURIComponent(key)] = decodeURIComponent(value);
    });
    return vars;
}	 

function main() {

	// Standard application, scene and interface setup
    var app = new CGFapplication(document.body);
    var myInterface = new MyInterface();
    var myScene = new XMLscene(myInterface);

    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

	// get file name provided in URL, e.g. http://localhost/myproj/?file=myfile.xml 
	// or use "demo.xml" as default (assumes files in subfolder "scenes", check MySceneGraph constructor) 
	
    var filename;

    var myGraph;

	// create and load graph, and associate it to scene. 
	// Check console for loading error
    filename=getUrlVars()['file'] || "ambient1.xml";
    myGraph = new MySceneGraph(filename, myScene,myInterface);

    let seconds = 0;
    let timer;

    function startTimer() {
      timer = setInterval(function() {
        seconds++;
        document.getElementById("timer").innerHTML = seconds;
      }, 1000);
    }

    function pauseTimer() {
      clearInterval(timer);
    }

    function resetTimer() {
      clearInterval(timer);
      seconds = 0;
      document.getElementById("timer").innerHTML = seconds;
    }
	
    var buttonsDiv = document.getElementById("buttons");
    var timerDiv = document.getElementById("timerDiv");
    var startButtonDiv = document.getElementById("startButtonDiv");
    var rulesButtonDiv = document.getElementById("rulesButtonDiv");
    var chooseAmbient = document.getElementById("chooseAmbient");
    startButton.onclick = () => {
        startTimer();
        myScene.gameController.startGame();
        timerDiv.hidden = false;
        startButtonDiv.hidden = true;
        rulesButtonDiv.hidden = true;
        chooseAmbient.hidden = true;
        buttonsDiv.hidden = false;
    }

    var undoButton = document.getElementById("undoButton");
    undoButton.onclick = () => {
        myScene.gameController.undoPlay();
    }

    var ambient1 = document.getElementById("ambientButton1");
    var ambient2 = document.getElementById("ambientButton2");
    var ambient3 = document.getElementById("ambientButton3");
    ambient1.onclick = () => {
        filename=getUrlVars()['file'] || "ambient1.xml";
        myGraph = new MySceneGraph(filename, myScene,myInterface);
    }
    ambient2.onclick = () => {
        filename=getUrlVars()['file'] || "ambient2.xml";
        myGraph = new MySceneGraph(filename, myScene,myInterface);
    }
    ambient3.onclick = () => {
        filename=getUrlVars()['file'] || "ambient3.xml";
        myGraph = new MySceneGraph(filename, myScene,myInterface);
    }

    var restartButton = document.getElementById("restartButton");
    restartButton.onclick = () => {
        resetTimer();
        myScene.startTime = Date.now();
        myScene.delta = 0;
        myScene.gameController = new MyGameController(myScene);
        myScene.lastPiecePicked = null;
        myScene.warningMessage = "";
        myScene.warningStartTime = -1;
        myScene.warningStillDuration = 2;
        myScene.warningFadeDuration = 0.5;
        myScene.gameController.gameState = "player1";
        document.getElementById("finalMessage").hidden = true;
        document.getElementById("finalButtonsDiv").hidden = true;
        document.getElementById("buttons").hidden = false;
        document.getElementById("undoButton").hidden = false;
        document.getElementById("warningMessage").hidden = true;
        myScene.cameraObject.cameraState = 1;
    }

    var rewatchButton = document.getElementById("reWatchButton");
    rewatchButton.onclick = () => {
        myScene.gameController.replayGame();
        document.getElementById("warningMessage").hidden = true;
        document.getElementById("finalMessage").hidden = true;
        document.getElementById("finalButtonsDiv").hidden = true;
        document.getElementById("buttons").hidden = true;
    }

    var cameraAnlgeSlider = document.getElementById("cameraAngleSlider");
    cameraAnlgeSlider.oninput = () => {
        myScene.cameraObject.cameraState = 3;
        myScene.cameraObject.currentAngle = parseFloat(cameraAnlgeSlider.value);
    }


	// start
    app.run();
}


main();
