precision highp float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float delta;
uniform float scale_h;
uniform float length_s;
uniform float length_t;

varying vec2 vTextureCoord;

void main() {
	vec4 vertex = vec4(aVertexPosition + aVertexNormal*scale_h*(delta+1.0)/2.0, 1.0);
	vTextureCoord = aTextureCoord;
	gl_Position = uPMatrix * uMVMatrix * vertex;
}
