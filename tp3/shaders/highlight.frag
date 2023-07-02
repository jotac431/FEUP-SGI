precision highp float;

varying vec4 coords;
varying vec4 normal;

uniform bool color;

void main() {
	if (color){
		gl_FragColor = vec4(1.0,1.0,1.0,1.0);
	}else{
		gl_FragColor = vec4(0,0,0,0);
	}
}