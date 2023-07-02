import { CGFobject } from '../lib/CGF.js';
/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTriangle extends CGFobject {
	constructor(scene,id, x1, x2, x3, y1, y2, y3, z1, z2, z3) {
		super(scene);
		this.id = id;
		this.x1 = x1;
		this.x2 = x2;
		this.x3 = x3;
		this.y1 = y1;
		this.y2 = y2;
		this.y3 = y3;
		this.z1 = z1;
		this.z2 = z2;
		this.z3 = z3;

		this.length_u = 1;
		this.length_v = 1;

		this.initBuffers();
	}
	initBuffers() {

		this.normals = [];
		this.texCoords = [];


		this.vertices = [
			this.x1, this.y1, this.z1,	//0
			this.x2, this.y2, this.z2,	//1
			this.x3, this.y3, this.z3,	//2
		];

		//Counter-clockwise reference of vertices

		this.indices = [
			0, 1, 2,
		];

		//Normals
		var norm_aux1 = [this.x1 - this.x2, this.y1 - this.y2, this.z1 - this.z2];
		var norm_aux2 = [this.x1 - this.x3, this.y1 - this.y3, this.z1 - this.z3];

		var x_norm = norm_aux1[1] * norm_aux2[2] - norm_aux1[2] * norm_aux2[1];
		var y_norm = norm_aux1[2] * norm_aux2[0] - norm_aux1[0] * norm_aux2[2];
		var z_norm = norm_aux1[0] * norm_aux2[1] - norm_aux1[1] * norm_aux2[0];

		this.normals.push(x_norm, y_norm, z_norm);
		this.normals.push(x_norm, y_norm, z_norm);
		this.normals.push(x_norm, y_norm, z_norm);

		//Distances
		this.a = Math.sqrt(Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2) + Math.pow(this.z2 - this.z1, 2));
		this.b = Math.sqrt(Math.pow(this.x3 - this.x2, 2) + Math.pow(this.y3 - this.y2, 2) + Math.pow(this.z3 - this.z2, 2));
		this.c = Math.sqrt(Math.pow(this.x3 - this.x1, 2) + Math.pow(this.y3 - this.y1, 2) + Math.pow(this.z3 - this.z1, 2));

		this.cos = (Math.pow(this.a, 2) - Math.pow(this.b, 2) + Math.pow(this.c, 2)) / (2 * this.a * this.c);
		this.sin = Math.sqrt(1 - Math.pow(this.cos, 2));


		this.texCoords = [
			0, 1,
			this.a, 1,
			(this.c * this.cos), 1 - (this.c * this.sin)
		]

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the triangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		var length_s = coords[0];
		var length_t = coords[1];
		this.texCoords = [
			0, 1,
			this.a / length_s, 1,
			(this.c * this.cos) / length_s, 1 - (this.c * this.sin) / length_t

		];

		this.updateTexCoordsGLBuffers();
	}
}