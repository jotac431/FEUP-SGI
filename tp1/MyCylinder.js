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
        for (var j = 0; j <= this.slices; j++) {
            this.vertices.push(this.top*Math.cos(j * 360 * DEGREE_TO_RAD / this.slices), this.top*Math.sin(j * 360 * DEGREE_TO_RAD / this.slices), 0);
            this.vertices.push(this.bottom*Math.cos(j * 360 * DEGREE_TO_RAD / this.slices), this.bottom* Math.sin(j * 360 * DEGREE_TO_RAD / this.slices),this.height);
        }
        /* INDICES */
        for (var j = 0; j < this.slices * 2; j = j + 2) {
            this.indices.push(j, j + 2, j + 1,
                j + 1, j + 2, j + 2 + 1);
            this.indices.push(j, j + 1, j + 2,
                j + 2 + 1, j + 2, j + 1);
        }

        /* NORMALS */
        for (var j = 0; j <= this.slices; j++) {
            this.normals.push(Math.cos(j * 360 * DEGREE_TO_RAD / this.slices), 0, Math.sin(j * 360 * DEGREE_TO_RAD / this.slices));
            this.normals.push(Math.cos(j * 360 * DEGREE_TO_RAD / this.slices), 0, Math.sin(j * 360 * DEGREE_TO_RAD / this.slices));
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
}