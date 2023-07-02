import { CGFobject } from '../lib/CGF.js';

var DEGREE_TO_RAD = Math.PI / 180;

/**
 * MyCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyCylinder extends CGFobject {
    constructor(scene, id, bottom, top, height, slices, stacks) {
        super(scene);
        this.id = id;
        this.bottom = bottom;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        /* VERTICES */
        for (var i = 0; i <= this.stacks; i++){
            for (var j = 0; j < this.slices; j++) {
                this.vertices.push((this.top + (this.bottom-this.top)*i/this.stacks)*Math.cos(j * 360 * DEGREE_TO_RAD / this.slices), (this.top + (this.bottom-this.top)*i/this.stacks)*Math.sin(j * 360 * DEGREE_TO_RAD / this.slices), this.height/this.stacks*i);
            }
        }
        
        /* INDICES */

        for(var i=0; i < this.stacks; i++){
            for (var j=0; j < this.slices - 1; j++){
                this.indices.push(i*this.slices + j, i*this.slices+j+1,(i+1)*this.slices + j);
                this.indices.push(i*this.slices + j+1, (i+1)*this.slices+j+1,(i+1)*this.slices + j);
                this.indices.push(i*this.slices+j+1, i*this.slices + j, (i+1)*this.slices + j);
                this.indices.push((i+1)*this.slices+j+1, i*this.slices + j+1, (i+1)*this.slices + j);
            }
            this.indices.push((i+1)*this.slices-1,i*this.slices,(i+2)*this.slices-1);
            this.indices.push(i*this.slices,(i+1)*this.slices,(i+2)*this.slices-1);
            this.indices.push(i*this.slices, (i+1)*this.slices-1, (i+2)*this.slices-1);
            this.indices.push((i+1)*this.slices, i*this.slices, (i+2)*this.slices-1);
        }


        /* NORMALS */
        for (var i = 0; i <= this.stacks; i++){
            for (var j = 0; j < this.slices; j++) {
                this.normals.push(this.top*Math.cos(j * 360 * DEGREE_TO_RAD / this.slices)*2, this.top*Math.sin(j * 360 * DEGREE_TO_RAD / this.slices)*2, 0);
            }
        }

        /* TEXT COORDS */
        for (var j = 0; j <= this.slices; j++) {
            this.texCoords.push(j/this.slices,1);
            this.texCoords.push(j/this.slices,0);
        }
        
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
    /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}

    setLineMode() 
	{ 
		this.primitiveType=this.scene.gl.LINES;
	};
    setFillMode() { 
		this.primitiveType=this.scene.gl.TRIANGLE_STRIP;
	}
};