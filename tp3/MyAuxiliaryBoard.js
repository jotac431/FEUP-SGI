import { MySphere } from './MySphere.js';
import { MyTile } from './MyTile.js';

export class MyAuxiliaryBoard{
    constructor(scene,gameController,board,centerCoords){
        this.scene = scene;
        this.gameController = gameController;
        this.centerCoords = centerCoords;
        //   +---+---+
        //   |   |   |
        //   +---+---+
        //   |   |   |
        //   +---+---+
        //   |   |   |
        //   +---X---+   <-- X is the center coords
        //   |   |   |
        //   +---+---+
        //   |   |   |
        //   +---+---+
        //   |   |   |
        //   +---+---+
        this.board = [];
        this.tileList = [];
        this.pieceList = [];
        this.transformMatrix = mat4.create();
        this.transformMatrix = mat4.translate(this.transformMatrix,this.transformMatrix,vec3.fromValues(centerCoords[0],0,centerCoords[1]));
        this.numberOfPieces = 0
        for (let i = 0; i < 2; i++) {
            var row = [];
            var tile;
            for (let j = 0; j < 6; j++) {
                if ((i+j) % 2 == 0){
                    tile = new MyTile(this.scene,[i,j], "white",null,i +"," + j + "tile");
                }else {
                    tile = new MyTile(this.scene,[i,j], "black", null, i +"," + j + "tile");
                }
                row.push(tile);
                this.tileList.push(tile);
            }
            this.board.push(row);
        }
    }

    display(){
        this.scene.pushMatrix();
        this.scene.multMatrix(this.transformMatrix);
        for(var i = 0; i < this.tileList.length; i++){
            this.tileList[i].display();
        }
        this.scene.popMatrix();
        for(var i = 0; i < this.pieceList.length; i++){
            this.pieceList[i].display();
        }
    }

    getTileAtCoords(x,y){
        return this.board[x-this.centerCoords[0]][y-this.centerCoords[1]];
    }

    updateNumberOfPieces(){
        var count = 0;
        for (var i = 0; i < this.tileList.length; i++){
            if (this.tileList[i].piece != null){
                count++;
            }
        }
        this.numberOfPieces = count;
    }

    //This function must be changed in the future to pass the piece to an auxiliary board
    getFreeCoords(){
        this.updateNumberOfPieces();
        if (this.numberOfPieces < 6){
            return [this.centerCoords[0],this.centerCoords[1]+this.numberOfPieces];
        }else{
            return [this.centerCoords[0]+1,this.centerCoords[1]+this.numberOfPieces-6];
        }
    }

    addPiece(piece){
            var coords = this.getFreeCoords();
            piece.animationType = 3;
            piece.moveToCoords(...coords);
            this.pieceList.push(piece);
            this.getTileAtCoords(...coords).piece = piece;
    }

    popPiece(){
        var piece = this.pieceList[this.pieceList.length-1]
        this.getTileAtCoords(...piece.coords).piece = null;
        this.pieceList.pop(piece);
        return piece
    }

    isFull(){
        if (this.pieceList.length == 12){
            return true;
        }
        return false;
    }
}
