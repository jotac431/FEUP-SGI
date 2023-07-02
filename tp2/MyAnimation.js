/*
--------NOTES ON ANIMATIONS----------

The animation is an object.
For every component that has a certain animation, a copy of the actual animation will be provided for it (using animation.clone()), so that animations can be at diferent stages in each component.
The animation is active if startTime is different from null.
If one wants to know the state of the animation, the function getCurrentAnimationMatrix will provide this information, giving a matrix that results of the interpolation of the transformation info from the previous and next keyframes relative to the current time.
The keyframes are also objects, containing an array with all the information for their transformations and a timestamp relative to the animation start time.

-------------------------------------
*/
export class MyAnimation{
    constructor(id,keyframes){
        this.startTime = null
        this.id = id;
        this.keyframes = keyframes; //Array of keyframes
        this.keyframeCount = this.keyframes.length;
        this.loop = true;
        for(var i = 0; i< this.keyframeCount - 1; i++){
            if (this.keyframes[i].timestamp > this.keyframes[i+1].timestamp){
                console.log("Animation " + this.id + " has keyframes out of order!");
                return null;
            } 
        }
        if (this.keyframeCount < 2){
            console.log("Insuficient number of keyframes in animation!");
            return null;
        }
        this.__animMatrix = mat4.create(); //Matrix to use when processing animations. Only here for not creating a new matrix every frame
    }
    //Return an array with two elements - the last keyframe that was passed and the next keyframe
    //If the animation is over, return null
    getCurrentKeyframes(){
        var currentTime = (Date.now() - this.startTime)/1000;
        if (this.currentTime > this.keyframes[this.keyframeCount-1].timestamp){
            //Animation as finished
            return null;
        }
        var i = 0;
        while(currentTime > this.keyframes[i+1].timestamp){
            i++;
        }
        return [this.keyframes[i],this.keyframes[i+1]]
    }
    //Returns the current animation matrix
    getCurrentAnimationMatrix(){
        //If the animation is not active then just return an identity matrix
        this.__animMatrix = mat4.identity(this.__animMatrix);
        if (this.startTime == null){
            return this.__animMatrix;
        }
        //If the animation has reached its end
        if (Date.now() > this.startTime + this.keyframes[this.keyframeCount - 1].timestamp * 1000){
            //If it is suposed to loop, restart the animation
            if(this.loop){
                //If the current time is in B and the start time is A and animation is in loop, then start time must forward all the way to C
                //                              A                                                       C           B
                //  ||----+-----+-----+----+----||----+-----+-----+----+----||----+-----+-----+----+----||----+-----+-----+----+----||
                //  ^                 ^
                // Anim Start      Keyframe
                while (Date.now() > this.startTime + this.keyframes[this.keyframeCount - 1].timestamp){
                    this.startTime += this.keyframes[this.keyframeCount - 1].timestamp;
                }
            //If not, set animation to non active (by setting startTime to null)
            }else{
                this.startTime = null;
                return this.__animMatrix;
            }
        }

        var currentKeyfs = this.getCurrentKeyframes();
        var delta = ((Date.now() - this.startTime)/1000 - currentKeyfs[0].timestamp) / (currentKeyfs[1].timestamp - currentKeyfs[0].timestamp);
        
        var translationVector = vec3.create();
        translationVector = vec3.lerp(translationVector,currentKeyfs[0].translation,currentKeyfs[1].translation,delta);
        this.__animMatrix = mat4.translate(this.__animMatrix,this.__animMatrix,translationVector);

        this.__animMatrix = mat4.rotateX(this.__animMatrix,this.__animMatrix,Math.PI/180*((currentKeyfs[1].rotations[0] - currentKeyfs[0].rotations[0])*delta + currentKeyfs[0].rotations[0]));
        this.__animMatrix = mat4.rotateY(this.__animMatrix,this.__animMatrix,Math.PI/180*((currentKeyfs[1].rotations[1] - currentKeyfs[0].rotations[1])*delta + currentKeyfs[0].rotations[1]));
        this.__animMatrix = mat4.rotateZ(this.__animMatrix,this.__animMatrix,Math.PI/180*((currentKeyfs[1].rotations[2] - currentKeyfs[0].rotations[2])*delta + currentKeyfs[0].rotations[2]));


        var scaleVector = vec3.create();
        scaleVector = vec3.lerp(scaleVector,currentKeyfs[0].scale,currentKeyfs[1].scale,delta);
        this.__animMatrix = mat4.scale(this.__animMatrix,this.__animMatrix,scaleVector);

        

        return this.__animMatrix;
    }
    //Returns a new animation just like this one
    clone(){
        var newAnimation =  MyAnimation(this.id, this.keyframes);
        newAnimation.startTime = this.startTime;
        newAnimation.keyframeCount = this.keyframeCount;
        newAnimation.loop = this.loop;
        return newAnimation;
    }
}

export class MyKeyframe{
    constructor(translation,rotations,scale,timestamp){
        this.translation = translation; //vec3
        this.rotations = rotations; //Vector with 3 rotations: x,y,z
        this.scale = scale; //vec3
        this.timestamp = timestamp
    }
}