precision highp float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float time;


void main() {
	vec4 new_vec = vec4(0,sin(time*0.0031415)/2.0+0.5,0,0);
	vec4 vertex = vec4(aVertexPosition,0.0) + new_vec;
	gl_Position = uPMatrix * uMVMatrix * vertex;
}
