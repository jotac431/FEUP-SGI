import { CGFappearance } from '../lib/CGF.js';
import { MyRectangle } from './MyRectangle.js';

export class MyTile{
    constructor(scene, coords, color, piece,id){
        this.id = id;
        this.scene = scene;
        this.coords = coords; //Coordinates of the piece. If it is a vector of length 2 we assume its the coordinates of the
                              //piece in board coordinates, a.k.a. the game coordinates. If coords has lenghts 3 then we
                              //assume it is a vector of global coordinates.
        this.material = new CGFappearance(scene)
        if (color == "black"){ //If color is black the tile will be black
            this.material.setDiffuse(0,0,0);
        }else if(color == "white"){  //If the color is white the tile will be white
            this.material.setDiffuse(1,1,1);
        }else{  //If some error occurs and none of the above is true, the tile will be red
            this.material.setDiffuse(1,0,0);
        }
        this.primitive = new MyRectangle(scene,"tile",-0.5,0.5,-0.5,0.5 ); //3d primitive to be displayed
        this.transformMatrix = null; //The actual transform matrix to be used to translate the tile
        this.updateTransformMatrixFromCoords()//Calculate the transform matrix from the coords. null means error
        this.piece = piece; //The piece that the tile contains, if it does not contain a piece then it is equal to null
    }
    //If coordinates are changed use this function to recalculate the transformMatrix so the tile actually moves
    updateTransformMatrixFromCoords(){
        this.transformMatrix = mat4.create();
        var translate_vec;
        if (this.coords.length == 2){
            translate_vec = vec3.fromValues(this.coords[0]-3.5, 0.01, this.coords[1]-3.5 );
        }else if(this.coords.length == 3){
            translate_vec = vec3.fromValues(this.coords[0], this.coords[1], this.coords[2]);
        }else{
            console.log("Error parsing coords given to the constructor of my tile")
            return null;
        }
        this.transformMatrix = mat4.translate(this.transformMatrix,this.transformMatrix, translate_vec);
        this.transformMatrix = mat4.rotateX(this.transformMatrix,this.transformMatrix,-Math.PI/2);
    }

    display(){
        this.scene.pushMatrix();
        this.scene.multMatrix(this.transformMatrix);
        this.material.apply();
        this.primitive.display();
        this.scene.popMatrix();
    }
}
