precision highp float;

varying vec4 coords;
varying vec4 normal;

uniform float delta;
uniform float r;
uniform float g;
uniform float b;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;	
uniform bool draw_text;

void main() {
	if (draw_text){
		vec4 color = texture2D(uSampler, vTextureCoord);
		float normDelta = (delta + 1.0)/2.0;
		vec4 matColor = vec4(r,g,b,1.0 -normDelta);
		gl_FragColor = color * matColor;
	}else{
		float normDelta = (delta + 1.0)/2.0;
		gl_FragColor = vec4(r,g,b,normDelta);
	}
}