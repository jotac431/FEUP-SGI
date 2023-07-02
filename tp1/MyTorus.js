import { CGFobject } from '../lib/CGF.js';

var DEGREE_TO_RAD = Math.PI / 180;

/**
 * MyTorus
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTorus extends CGFobject {
    constructor(scene, id, inner, outer, slices, loops) {
        super(scene);
        this.id = id;
        this.inner = inner;
        this.outer = outer;
        this.slices = slices;
        this.loops = loops;
        this.initBuffers();
    }
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var outer_ang = 360 * DEGREE_TO_RAD / this.loops;
        var inner_ang = 360 * DEGREE_TO_RAD / this.slices;

        for (var i = 0; i <= this.loops; i++) {
            for (var j = 0; j <= this.slices; j++) {
                this.vertices.push((this.outer + this.inner * Math.cos(j*inner_ang)) * Math.cos(i*outer_ang), (this.outer + this.inner * Math.cos(j*inner_ang)) * Math.sin(i*outer_ang), this.inner * Math.sin(j*inner_ang));
                this.normals.push((this.outer + this.inner * Math.cos(j*inner_ang)) * Math.cos(i*outer_ang), (this.outer + this.inner * Math.cos(j*inner_ang)) * Math.sin(i*outer_ang), this.inner * Math.sin(j*inner_ang));
                this.texCoords.push(i / this.loops, j / this.slices);
            }
        }

        for (var i = 0; i <= this.loops; i++) {
            for (var j = 0; j < this.slices; j++) {
                this.indices.push(j + 1 + i*this.slices, j + i*this.slices, j + 1 + (i+1)*this.slices,
                j + i*this.slices, j + (i+1)*this.slices, j + 1 + (i+1)*this.slices);
            }
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