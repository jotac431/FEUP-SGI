import { CGFobject, CGFnurbsObject, CGFnurbsSurface } from '../lib/CGF.js';

/**
 * MyPatch
 * @constructor
 * @param scene - Reference to MyScene object
 * @param degree_u - degree in U
 * @param degree_v - degree in V
 * @param parts_u - parts in U
 * @param parts_v - parts in V
 * @param vertexes - control points
 */
export class MyPatch extends CGFobject {
	constructor(scene, degree_u, degree_v, parts_u, parts_v, vertexes) {
        super(scene);
        this.degree_u = degree_u;
        this.degree_v = degree_v;
		this.parts_u = parts_u;
        this.parts_v = parts_v;
        this.vertexes = vertexes;
        this.initBuffers();
	}

	initBuffers() {
        var nurbSurface = new CGFnurbsSurface(this.degree_u, this.degree_v, this.vertexes);
        this.obj = new CGFnurbsObject(this.scene,this.parts_u, this.parts_v, nurbSurface);
    }

    display() {
        this.obj.display();
    }
    updateTexCoords(coords) {
        this.texCoords = [...coords];
        this.updateTexCoordsGLBuffers();
    }
}
