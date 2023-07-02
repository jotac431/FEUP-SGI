import { MyBoard } from "./MyBoard.js";
import { MyAuxiliaryBoard } from "./MyAuxiliaryBoard.js";

export class MyGameController{
    constructor(scene){
        this.scene = scene;
        this.board = new MyBoard(this.scene,this)
        this.board.whiteAuxBoard = new MyAuxiliaryBoard(this.scene,this,this.board,[-3,1])
        this.board.blackAuxBoard = new MyAuxiliaryBoard(this.scene,this,this.board,[9,1])
        this.gameState = "menu"
        this.lastPlays = []
    }

    startGame(){
        this.gameState = "player2";
        this.scene.cameraObject.cameraState = 2;
    }
    //Move piece to tile
    processPlay(piece,tile){
        console.log("Processing play of piece at " + piece.coords + " to " + tile.coords);
        //Saving piece coords for later
        var old_piece_coords = piece.coords;
        //Defining type of piece animation
        piece.animationType = 2;
        //Check if the color of the piece corresponds to the turn
        if (((piece.color == "white" && this.gameState != "player1") || (piece.color == "black" && this.gameState != "player2")) && this.gameState != "replay"){
            console.log("ERROR Played wrong color piece");
            this.scene.raiseWarning("Playing wrong color")
            return false;
        }
        //Check if tile is occupied
        if (tile.piece != null){
            console.log("ERROR tile is occupied")
            if(tile.coords[0] != piece.coords[0] || tile.coords[1] != piece.coords[1]){
                this.scene.raiseWarning("Tile already occupied")
            }
            return false;
        }
        //Check if the piece is moving in the right direction
        if (!piece.isQueen){
            if (piece.color == "white" && piece.coords[1] <= tile.coords[1]){
                this.scene.raiseWarning("Piece moved in the wrong direction")
                console.log("ERROR moving in the wrong direction")
                return false;
            }
            if (piece.color == "black" && piece.coords[1] >= tile.coords[1]){
                this.scene.raiseWarning("Piece moved in the wrong direction")
                console.log("ERROR moving in the wrong direction")
                return false;
            }
        }
        //Check if piece is moving in diagonal
        var delta = piece.coords[0] - tile.coords[0];
        if (tile.coords[1] + delta != piece.coords[1] && tile.coords[1] - delta != piece.coords[1]){
            this.scene.raiseWarning("Pieces must move in diagonals")
            console.log("ERROR not moving in a diagonal")
            return false
        }

        //Check if piece can eat another piece
        var eatIsPossible = false;
        if (this.gameState != "replay"){
            for (var i = 0; i < this.board.pieceList.length; i++){
                if (eatIsPossible){break;}
                var curr_piece = this.board.pieceList[i];
                if((this.gameState == "player1" && curr_piece.color == "black") || (this.gameState == "player2" && curr_piece.color == "white")){
                    continue;
                }
                if (curr_piece.color == "black" || (curr_piece.color == "white" && curr_piece.isQueen)){
                    //Check right diagonal
                    var diag2Tile = this.board.getTileAtCoords(curr_piece.coords[0] - 2, curr_piece.coords[1]+2);
                    if (diag2Tile != null){
                        var diag1Tile = this.board.getTileAtCoords(curr_piece.coords[0] - 1, curr_piece.coords[1]+1);
                        if(diag2Tile.piece == null && diag1Tile.piece != null && diag1Tile.piece.color != curr_piece.color){
                            eatIsPossible = true;
                        }
                    }
                    //Check left diagonal
                    diag2Tile = this.board.getTileAtCoords(curr_piece.coords[0] + 2, curr_piece.coords[1]+2);
                    if (diag2Tile != null && !eatIsPossible){
                        var diag1Tile = this.board.getTileAtCoords(curr_piece.coords[0] + 1, curr_piece.coords[1]+1);
                        if(diag2Tile.piece == null && diag1Tile.piece != null && diag1Tile.piece.color != curr_piece.color){
                            eatIsPossible = true;
                        }
                    }
                }
                if ((curr_piece.color == "white" || (curr_piece.color == "black" && curr_piece.isQueen)) && !eatIsPossible){
                    //Check right diagonal
                    var diag2Tile = this.board.getTileAtCoords(curr_piece.coords[0] + 2, curr_piece.coords[1]-2);
                    if (diag2Tile != null){
                        var diag1Tile = this.board.getTileAtCoords(curr_piece.coords[0] + 1, curr_piece.coords[1]-1);
                        if(diag2Tile.piece == null && diag1Tile.piece != null && diag1Tile.piece.color != curr_piece.color){
                            eatIsPossible = true;
                        }
                    }
                    //Check left diagonal
                    diag2Tile = this.board.getTileAtCoords(curr_piece.coords[0] - 2, curr_piece.coords[1]-2);
                    if (diag2Tile != null && !eatIsPossible){
                        var diag1Tile = this.board.getTileAtCoords(curr_piece.coords[0] - 1, curr_piece.coords[1]-1);
                        if(diag2Tile.piece == null && diag1Tile.piece != null && diag1Tile.piece.color != curr_piece.color){
                            eatIsPossible = true;
                        }
                    }
                }
            }
        }


        //Check if tile is one diagonal away or is two diagonals away and there is a piece in between
        if (Math.abs(delta) == 1){
            if (eatIsPossible){
                this.scene.raiseWarning("It's possible to capture another piece so you must capture!")
                console.log("ERROR a capture is possible but it was not made")
                return false;
            }
            piece.tile.piece = null;
            piece.tile = tile;
            piece.moveToCoords(...tile.coords);
            tile.piece = piece;
            this.changeTurn();
        }else if(Math.abs(delta) == 2){
            var middle_tile = this.board.getTileAtCoords(tile.coords[0] + parseInt((piece.coords[0] - tile.coords[0])/2),tile.coords[1] + parseInt((piece.coords[1] - tile.coords[1])/2));
            //No piece between piece and tile, so play is invalid
            if (middle_tile.piece == null){
                this.scene.raiseWarning("You can only move one diagonal at a time or capture another piece")
                console.log("ERROR no piece in the middle");
                return false;
            }
            if (middle_tile.piece.color == piece.color){
                this.scene.raiseWarning("Are you sure you want to capture your own pieces?...")
                console.log("ERROR trying to capture own piece");
                return false;
            }
            console.log("Piece at " + middle_tile.coords + " was captured");
            this.board.removePiece(middle_tile.piece);
            middle_tile.piece = null;
            piece.tile.piece = null;
            piece.tile = tile;
            piece.moveToCoords(...tile.coords);
            tile.piece = piece;
        }else{
            this.scene.raiseWarning("You can only move one diagonal at a time or captureanother piece")
            console.log("Too far away")
            return false;
        }
        if ((piece.color == "white" && tile.coords[1] == 0) || (piece.color == "black" && tile.coords[1] == 7)){
            piece.transformQueen();
        }
        this.lastPlays.push([...old_piece_coords,...tile.coords])
        return true;
    }

    changeTurn(){
        if (this.gameState == "player1"){
            this.gameState = "player2";
            this.scene.cameraObject.cameraState = 2;
        }else if (this.gameState == "player2"){
            this.gameState = "player1"
            this.scene.cameraObject.cameraState = 1;
        }else{
            console.log("Tried to change turns but the game is not ongoing!")
        }
    }

    undoPlay(){
        //When we refer to the "new tile", we mean the tile the piece was moved to during the play,
        //so here the last tile is actually the tile the piece was before the play, therefore the new
        //tile the piece will occupy after the undo
        if (this.lastPlays.length == 0){
            return false;
        }
        var lastPlay = this.lastPlays.pop();
        var pieceLastCoords = [lastPlay[0],lastPlay[1]]
        var tileNewCoords = [lastPlay[2],lastPlay[3]]
        var newTile = this.board.getTileAtCoords(...tileNewCoords);
        var lastTile = this.board.getTileAtCoords(...pieceLastCoords);
        //If a piece was eaten
        if (Math.abs(tileNewCoords[0]-pieceLastCoords[0]) == 2){
            var eatenPiece;
            if (newTile.piece.color == "white"){
                eatenPiece = this.board.blackAuxBoard.popPiece();
            }else{
                eatenPiece = this.board.whiteAuxBoard.popPiece();
            }
            var middleTile = this.board.getTileAtCoords(lastPlay[0] + parseInt((lastPlay[2]-lastPlay[0])/2), lastPlay[1] + parseInt((lastPlay[3]-lastPlay[1])/2))
            console.log("Middle Tile: " + eatenPiece)
            middleTile.piece = eatenPiece;
            eatenPiece.moveToCoords(middleTile.coords[0],middleTile.coords[1])
            eatenPiece.tile = middleTile
            this.board.pieceList.push(eatenPiece);
        }
        var piece = newTile.piece;
        newTile.piece = null;
        lastTile.piece = piece;
        piece.tile = lastTile;
        piece.moveToCoords(...lastTile.coords);
        this.changeTurn();
        return true;
    }

    replayGame(){
        this.gameState = "replay-pre";
        this.lastPlaysCopy = [...this.lastPlays]; //Create a copy of last plays
        while (this.undoPlay()){;} //Undo all plays
        for (var i = 0; i < this.board.pieceList.length; i++){
            this.board.pieceList[i].isQueen = false;
        }
        this.lastReplayPlayedPiece = null;
        this.replayPlayNumber = 0;
    }
}
