import { CGFappearance } from "../lib/CGF.js";
import { MyBoard } from "./MyBoard.js";
import { MyCylinder } from "./MyCylinder.js"
import { MyPatch } from "./MyPatch.js";
import { MyRectangle } from "./MyRectangle.js";
import { MyTriangle } from "./MyTriangle.js";
import { MySphere } from "./MySphere.js"
import { MyTorus } from "./MyTorus.js";

export class MyPiece {
    constructor(scene, id, color, coords, tile) {
        this.scene = scene;
        this.id = id;
        this.coords = coords; //Game coords
        this.tile = tile;
        this.transformMatrix = mat4.create();//The actual transform matrix to be used to translate the piece
        this.material = new CGFappearance(scene);
        this.queenMaterial = new CGFappearance(scene);
        this.color = color;
        if (color == "white") {
            this.material.setDiffuse(1, 1, 1);
            this.queenMaterial.setDiffuse(1, 1, 1);
        } else if (color == "black") {
            this.material.setDiffuse(0.1, 0.1, 0.1);
            this.queenMaterial.setDiffuse(0.1, 0.1, 0.1);
        } else {
            this.material.setDiffuse(1, 0, 0); //Set piece as red in case of color error
        }
        this.isQueen = false;

        this.top = new MyPatch(this.scene, 1, 3, 20, 20, [[[0, -0.5, 0, 1], [-0.5, -0.5, 0, 1], [-0.5, 0.5, 0, 1], [0, 0.5, 0, 1]], [[0, -0.5, 0, 1], [0.5, -0.5, 0, 1], [0.5, 0.5, 0, 1], [0, 0.5, 0, 1]]])
        this.bottom = new MyPatch(this.scene, 1, 3, 20, 20, [[[0, -0.5, 0, 1], [-0.5, -0.5, 0, 1], [-0.5, 0.5, 0, 1], [0, 0.5, 0, 1]], [[0, -0.5, 0, 1], [0.5, -0.5, 0, 1], [0.5, 0.5, 0, 1], [0, 0.5, 0, 1]]])
        this.primitive = new MyCylinder(this.scene, id + "primitive", 0.4, 0.4, 0.2, 20, 20);

        //Animation stuff
        this.animationType = 2;
        this.displayCoords = [coords[0] - 3.5, 0, coords[1] - 3.5]; //The actual coordinates of the piece, that might not correspond to the game coords because of animations
        this.updateTransformMatrixFromCoords()//Calculate the transform matrix from the coords
        this.animationDuration = 1;
        this.animationLastCoords = [];
        this.animationStartTime = -1; //If -1, no animation is active
        this.jumpAnimationDelay = 0.37;
        this.queenTransformationTime = -1;
        this.queenTransformationDuration = 0.5;
    }

    //If coordinates are changed use this function to recalculate the transformMatrix so the piece actually moves
    updateTransformMatrixFromCoords() {
        this.transformMatrix = mat4.identity(this.transformMatrix);
        var translate_vec;
        if (this.displayCoords.length == 3) {
            translate_vec = vec3.fromValues(this.displayCoords[0], this.displayCoords[1], this.displayCoords[2]);
        } else {
            console.log("Error parsing displayCoords given to the constructor of my tile")
            return null;
        }
        this.transformMatrix = mat4.translate(this.transformMatrix, this.transformMatrix, translate_vec);
        this.transformMatrix = mat4.rotateX(this.transformMatrix, this.transformMatrix, -Math.PI / 2);
    }

    transformQueen() {
        this.isQueen = true;
        this.queenTransformationTime = Date.now();
    }
    display() {
        //Process animations
        this.processAnimations();
        //Move piece to position
        this.scene.pushMatrix();
        this.scene.multMatrix(this.transformMatrix);
        var progress = ((Date.now() - this.animationStartTime) / 1000 / this.animationDuration);
        if (this.animationStartTime != -1 && this.animationType==3 && progress > this.jumpAnimationDelay){
            progress = (progress-this.jumpAnimationDelay)/(1-this.jumpAnimationDelay)
            var rot_mat = mat4.create();
            rot_mat = mat4.rotateX(rot_mat,rot_mat,Math.PI * 4*progress);
            this.scene.multMatrix(rot_mat);
        }

        //If it is selected, than give animation
        if (this.scene.lastPiecePicked != null && this.scene.lastPiecePicked.id == this.id){
            this.scene.pushMatrix();
            var anim_mat = mat4.create();
            anim_mat = mat4.rotateZ(anim_mat,anim_mat,Math.PI*2/3000*Date.now());
            anim_mat = mat4.translate(anim_mat,anim_mat,vec3.fromValues(0,0,0.5));
            anim_mat = mat4.rotateY(anim_mat,anim_mat,Math.PI/12);
            this.scene.multMatrix(anim_mat);
        }
        //Apply the material
        if (this.isQueen) {
            this.queenMaterial.apply();
        } else {
            this.material.apply();
        }
        //Display the piece
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.2);
        this.scene.scale(1.05, 0.8, 1);
        this.top.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI,1,0,0);
        this.scene.scale(1.05, 0.8, 1);
        this.bottom.display();
        this.scene.popMatrix();
        this.primitive.display();

        //If it is a queen, display two pieces on top of each other
        if (this.isQueen) {
            var queenHeight = 0;
            //Animate the transformation to a queen
            if (Date.now() > this.queenTransformationTime + this.animationDuration*1000 && Date.now() < this.queenTransformationTime + (this.animationDuration + this.queenTransformationDuration)*1000){
                var progress = (Date.now() - (this.queenTransformationTime + this.animationDuration*1000))/(this.queenTransformationDuration*1000)
                queenHeight = 0.21 * (-2*progress*progress+3*progress);
            }else  if (Date.now() > this.queenTransformationTime + (this.animationDuration + this.queenTransformationDuration)*1000){
                queenHeight = 0.21   
            }else{
                queenHeight = 0;
            }
            //Draw the top piece of the queen
            this.scene.translate(0, 0, queenHeight);
            this.scene.pushMatrix();
            this.scene.translate(0, 0, 0.2);
            this.scene.scale(1.05, 0.8, 1);
            this.top.display();
            this.scene.popMatrix();
            this.primitive.display();
        }

        if (this.scene.lastPiecePicked != null && this.scene.lastPiecePicked.id == this.id){
            this.scene.popMatrix();
        }
        this.scene.popMatrix();

    }

    moveToCoords(x, y) {
        if (x>=0 && x<=7 && y>=0 && y<=7 && this.coords[0] >= 0 && this.coords[0] <= 7 && this.coords[1] >= 0 && this.coords[1] <= 7){
            this.animationType = 2;
        }
        this.animationLastCoords = this.coords;
        this.coords = [x, y];
        this.updateTransformMatrixFromCoords();
        this.animationStartTime = Date.now();
    }
    processAnimations() {
        //Check if animation is active
        if (this.animationStartTime == -1) {
            return
        }
        //Check if it has ended
        if ((Date.now() - this.animationStartTime) / 1000 > this.animationDuration) {
            this.displayCoords = [this.coords[0] - 3.5, 0, this.coords[1] - 3.5];
            this.updateTransformMatrixFromCoords();
            this.animationStartTime = -1;
            return
        }
        //Get the progress of the animation
        var progress = (Date.now() - this.animationStartTime) / 1000 / this.animationDuration;
        //Mutate the animation
        if (this.animationType == 1) {
            if (progress < 0.5) {
                progress = 3.85 * Math.pow(progress, 2) - 0.95 * progress;
            } else {
                progress = 1 - (3.85 * Math.pow(1 - progress, 2) - 0.95 * (1 - progress));
            }
        } else if (this.animationType == 2) {
            progress = 1 / (1 + Math.exp(-9 * (progress - 0.5)));
        }
        if (this.animationType == 3) {
            //Implementing delay
            if (progress < this.jumpAnimationDelay){
                progress = 0;
            }else{
                progress = (progress-this.jumpAnimationDelay)/(1-this.jumpAnimationDelay)
            }
            var heightProgress = -2 * progress * progress + 2 * progress
            var animationDistance = Math.sqrt(Math.pow((this.coords[0] - this.animationLastCoords[0]), 2) + Math.pow((this.coords[1] - this.animationLastCoords[1]), 2));
            this.displayCoords = [(this.coords[0] - this.animationLastCoords[0]) * progress + this.animationLastCoords[0] - 3.5, animationDistance * heightProgress, (this.coords[1] - this.animationLastCoords[1]) * progress + this.animationLastCoords[1] - 3.5]
        } else {
            this.displayCoords = [(this.coords[0] - this.animationLastCoords[0]) * progress + this.animationLastCoords[0] - 3.5, 0, (this.coords[1] - this.animationLastCoords[1]) * progress + this.animationLastCoords[1] - 3.5]
        }
        this.updateTransformMatrixFromCoords();
    }
}