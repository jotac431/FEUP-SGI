import { CGFobject } from '../lib/CGF.js';
/**
 * MyGameCamera
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyGameCamera{
	constructor(camera) {
		this.camera = camera; //CGFCamera object
		this.cameraState = 0; //If 0  loiters around the board, if 1 goes to player 1 prespective, if 2 goes to player 2 perspecite
		this.cameraAngularVelocity = 10 //Velocity with which the camera rotates to a player position
		this.cameraLoiteringAngularVelocity = 0.1 //Velocity with which the camera rotates while loitering
		this.currentAngle = 0;
		this.lastTimestamp = Date.now();
		this.cameraCenter = [0,0,0];
		this.cameraRotationRadius = 6;
		this.cameraHeight = 6;
	}

	move(){

		//Adjust camera html slider
		document.getElementById("cameraAngleSlider").value = this.currentAngle;



		var currTimestamp = Date.now()
		var delta = (currTimestamp - this.lastTimestamp) / 1000; //Time in seconds since last camera position update
		//Loitering
		if (this.cameraState==0){
			this.currentAngle += this.cameraLoiteringAngularVelocity * delta;
			this.camera.setPosition(this.calculatePositionFromAngle());
			// Make current anlge be in the range [0,2*PI]
			while (this.currentAngle > 2 * Math.PI){
				this.currentAngle -= 2* Math.PI
			}
			while (this.currentAngle < 0){
				this.currentAngle += 2* Math.PI
			}
		}
		//Player 1
		if (this.cameraState == 1){
			if (this.currentAngle != 0){
				var lastAngle = this.currentAngle;
				this.currentAngle += this.cameraAngularVelocity * delta;
				//Check if we crossed the aimed angle
				if ((lastAngle < 2 * Math.PI && this.currentAngle > 2*Math.PI) || (lastAngle > 0 && this.currentAngle <0)){
					this.currentAngle = 0;
				}
				this.camera.setPosition(this.calculatePositionFromAngle());
				// Make current anlge be in the range [0,2*PI]
				while (this.currentAngle > 2 * Math.PI){
					this.currentAngle -= 2* Math.PI
				}
				while (this.currentAngle < 0){
					this.currentAngle += 2* Math.PI
				}
			}
		}
		//Player 2
		if (this.cameraState == 2){
			if (this.currentAngle != Math.PI){
				var lastAngle = this.currentAngle;
				this.currentAngle += this.cameraAngularVelocity * delta;
				//Check if we crossed the aimed angle
				if ((lastAngle < Math.PI && this.currentAngle > Math.PI) || (lastAngle > Math.PI && this.currentAngle < Math.PI)){
					this.currentAngle = Math.PI;
				}
				this.camera.setPosition(this.calculatePositionFromAngle());
				// Make current anlge be in the range [0,2*PI]
				while (this.currentAngle > 2 * Math.PI){
					this.currentAngle -= 2* Math.PI
				}
				while (this.currentAngle < 0){
					this.currentAngle += 2* Math.PI
				}
			}
		}
		if (this.cameraState == 3){
			this.camera.setPosition(this.calculatePositionFromAngle());
		}
		this.lastTimestamp = currTimestamp;
	}
	calculatePositionFromAngle(){
		return [this.cameraCenter[0] + Math.sin(this.currentAngle) * this.cameraRotationRadius, this.cameraCenter[1] + this.cameraHeight, this.cameraCenter[2] + Math.cos(this.currentAngle) * this.cameraRotationRadius]
	}
}

