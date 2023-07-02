import { CGFscene, CGFshader } from '../lib/CGF.js';
import { CGFaxis,CGFcamera } from '../lib/CGF.js';
import { MyBoard } from './MyBoard.js';
import { MyGameCamera } from './MyGameCamera.js';
import { MyGameController } from './MyGameController.js';


var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
        this.cameraObject = null;

    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.startTime = Date.now();
        this.delta = 0;

        this.highlightShader = new CGFshader(this.gl,"shaders/highlight.vert","shaders/highlight.frag");

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(100);
        this.gameController = new MyGameController(this);

        
        this.lastPiecePicked = null;

        this.warningMessage = "";
        this.warningStartTime = -1;
        this.warningStillDuration = 2;
        this.warningFadeDuration = 0.5;


        //Enables CGF capability of picking objects
        this.setPickEnabled(true); //must be last line of this function (I think)
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(1.2, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
        this.cameraObject = new MyGameCamera(this.camera)
        this.updateProjectionMatrix();
        this.loadIdentity();
        this.applyViewMatrix();
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.

        for (var i = 0; i < this.lights.length;i++){
            this.lights[i].disable();
        }
        i=0;
        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);

                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[6]);
                    this.lights[i].setSpotExponent(light[7]);
                    this.lights[i].setSpotDirection(light[8][0], light[8][1], light[8][2]);
                }

                this.lights[i].setVisible(true);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }
    }

    updateLights(){
        for (var i = 0; i < this.lights.length; i++){
            this.lights[i].setVisible();
            this.lights[i].update();
        }
    }


    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }
    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLights();

        this.sceneInited = true;
        this.setUpdatePeriod(100);
        this.startTime = null;  
    }

    /**
     * Displays the scene.
     */
    display() {

        // ---- BEGIN Background, camera and axis setup
        //Resets stuff for picking objects
        this.clearPickRegistration();
        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);

        //Updating camera's position
        this.cameraObject.move()

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();
        


        if (this.sceneInited) {

            //Put code that requires picking inside this if
            if (this.pickMode == false){
                if(this.pickResults.length > 0 ){
                    console.log("Something was clicked");
                }
                if (this.pickResults != null && this.pickResults.length > 0){ //Check if anything was picked
                    //Go through all the objects that were picked 
                    for (var i = 0; i < this.pickResults.length;i++){
                        var customId = this.pickResults[i][1];
                        if (customId >= 101 && customId < 201){ //This means a piece was picked
                            console.log("Pice picked")
                            var picked_piece = this.gameController.board.pieceList[customId-101];
                            if ((picked_piece.color == "white" && this.gameController.gameState == "player1") || (picked_piece.color == "black" && this.gameController.gameState == "player2")){
                                this.lastPiecePicked = picked_piece;
                            }
                        }
                        if (customId<101 && this.lastPiecePicked != null){ //This means a tile was picked and prevously a piece was picked
                            console.log("Tile picked after piece")
                            var pickedTile = this.gameController.board.tileList[customId-1];
                            this.gameController.processPlay(this.lastPiecePicked,pickedTile);
                            this.lastPiecePicked = null;
                        }
                    }
                }
                //Clear results array
				this.pickResults.splice(0,this.pickResults.length);
            }


            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();

            //Display board
            this.gameController.board.display();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup

        //Show warnings
        if (this.warningStartTime != -1){ //There is an active warning
            var ellapsedTime = (Date.now() - this.warningStartTime)/1000;
            if(ellapsedTime < this.warningStillDuration){ //The warning should stay visible for 2 seconds
                document.getElementById("warningMessage").style.color = "#ff0000"
            }else if(ellapsedTime > this.warningStillDuration && ellapsedTime < this.warningStillDuration + this.warningFadeDuration){ //The warning should fade for 1 seconds
                document.getElementById("warningMessage").style.color = "#ff0000" + Math.floor((1-(ellapsedTime-this.warningStillDuration)/this.warningFadeDuration)*255).toString(16);
            }else{
                document.getElementById("warningMessage").hidden = true;
                this.warningStartTime = -1
            }
        }

        //Check if the game has ended

        if (this.gameController.board.blackAuxBoard.isFull() || this.gameController.board.whiteAuxBoard.isFull()){
            this.gameController.gameState = "ending";
            document.getElementById("finalMessage").hidden = false;
            if (this.gameController.board.blackAuxBoard.isFull()){
                document.getElementById("finalMessage").innerHTML = "White won the game!"
            }else{
                document.getElementById("finalMessage").innerHTML = "Black won the game!"
            }
            document.getElementById("finalButtonsDiv").hidden = false;
            document.getElementById("undoButton").hidden = true;
            this.cameraObject.cameraState = 0;
        }

    }
    update(time) {
        if (this.sceneInited) {
            //If start time is not yet set, set it to current time
            if (this.startTime == null){
                this.startTime = time;
                if (this.graph.animations != undefined){
                    var animationNames = Object.keys(this.graph.animations);
                    for(var i = 0; i < animationNames.length; i++){
                        this.graph.animations[animationNames[i]].startTime = time;
                    }
                }
            }
            this.graph.nodes[this.graph.idRoot].computeAnimation(time - this.startTime)
        }
    }

    raiseWarning(message){
        this.warningMessage = message;
        document.getElementById("warningMessage").innerHTML = message;
        document.getElementById("warningMessage").hidden = false;
        this.warningStartTime = Date.now();
    }

    
}