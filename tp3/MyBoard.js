import { MyTile } from './MyTile.js';
import { MyPiece } from './MyPiece.js';

export class MyBoard{
    constructor(scene,gameController){
        this.scene = scene;
        this.gameController = gameController;
        this.board = [];
        this.blackTaken = [];
        this.whiteTaken = [];
        this.tileList = [];
        this.pieceList = [];
        this.whiteAuxBoard = null;
        this.blackAuxBoard = null;
        
        let id = 0;
        for (let i = 0; i < 8; i++) {
            var row = [];
            var tile;
            for (let j = 0; j < 8; j++) {
                if ((i+j) % 2 == 0){
                    tile = new MyTile(this.scene,[i,j], "white",null,i +"," + j + "tile");
                }else {
                    id++;
                    if (j <= 2){
                        var piece = new MyPiece(this.scene, id + "black", "black",[i,j],null);
                        this.pieceList.push(piece)
                        tile = new MyTile(this.scene,[i,j], "black", piece, i +"," + j + "tile");
                        piece.tile = tile
                    }else if ( j >= 5) {
                        var piece = new MyPiece(this.scene, id + "white", "white",[i,j],null);
                        this.pieceList.push(piece)
                        tile = new MyTile(this.scene,[i,j], "black", piece,i +"," + j + "tile");
                        piece.tile = tile
                    }else{
                        tile = new MyTile(this.scene,[i,j], "black", null,i +"," + j + "tile");
                    }
                }
                row.push(tile);
                this.tileList.push(tile);
            }
            this.board.push(row);
        }
    }

    display(){
        //If the board is gettting ready to the game film
        if(this.gameController.gameState == "replay-pre"){
            var count = 0;
            for(var i= 0; i< this.pieceList.length;i++){
                if (this.pieceList[i].animationStartTime == -1){
                    count++;
                }
            }
            if (count == this.pieceList.length){
                this.gameController.gameState = "replay";
            }
        }
        //If the game film is ongoing
        if (this.gameController.gameState == "replay"){
            //If the game film has ended
            if (this.gameController.replayPlayNumber == this.gameController.lastPlaysCopy.length){
                this.gameController.gameState = "ending";
                document.getElementById("finalMessage").hidden = false;
                if (this.gameController.board.blackAuxBoard.isFull()){
                    document.getElementById("finalMessage").innerHTML = "White wins the game!"
                }else{
                    document.getElementById("finalMessage").innerHTML = "Black wins the game!"
                }
                document.getElementById("finalButtonsDiv").hidden = false;
                document.getElementById("undoButton").hidden = true;
                this.scene.cameraObject.cameraState = 0;
            }
            if(this.gameController.lastReplayPlayedPiece == null || (this.gameController.lastReplayPlayedPiece.animationStartTime == -1)){
                var play = this.gameController.lastPlaysCopy[this.gameController.replayPlayNumber];
                var piece = this.getTileAtCoords(play[0],play[1]).piece;
                this.gameController.lastReplayPlayedPiece = piece;
                var tile = this.getTileAtCoords(play[2],play[3]);
                this.gameController.processPlay(piece,tile);
                this.gameController.replayPlayNumber+= 1;
            }
        }

        //Tile tags start in 1
        var count = 0
        for(var i = 0; i < this.tileList.length; i++){
            count++;
            this.scene.registerForPick(i+1,this.tileList[i]);
            this.tileList[i].display();
        }
        //Piece tags start in 101
        for(var i = 0; i < this.pieceList.length; i++){
            this.scene.registerForPick(i+101,this.pieceList[i]);
            this.pieceList[i].display();
        }
        this.blackAuxBoard.display();
        this.whiteAuxBoard.display();
    }

    getTileAtCoords(x,y){
        if (x < 0 || x > 7 || y<0 || y > 7){
            return null;
        }
        return this.board[x][y];
    }

    //This function must be changed in the future to pass the piece to an auxiliary board
    removePiece(piece){
        //Remove the piece from the board piece list
        for (var i = 0; i < this.pieceList.length; i++){
            if (this.pieceList[i].id == piece.id){
                this.pieceList.splice(i,1);
            }
        }
        //Adding piece to correct board
        if (piece.color == "white"){
            this.whiteAuxBoard.addPiece(piece);
        }
        if (piece.color == "black"){
            this.blackAuxBoard.addPiece(piece);
        }
    }
}
