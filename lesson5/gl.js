var gl

function initGL(canvas) {
	try{
		gl = canvas.getContext("experimental-webgl");
		gl.viewPortWidth = canvas.width;
		gl.viewPortHeight = canvas.height;
	}catch(e){
		// do nothing
	}
	if (!gl){
		console.log('Could not load opengl sorry');
	}
}

function getShaderText(shaderScript){
	var path=shaderScript.src;
	var request = new XMLHttpRequest();
	request.open("GET", path, false);
	request.send(null);
	return request.responseText;
}


function getShader(gl, id){
	var shaderScript = document.getElementById(id);
	if (!shaderScript) return null;

	var shader = null;
	if (shaderScript.type == "x-shader/x-fragment"){
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	}else if (shaderScript.type == "x-shader/x-vertex"){
		shader = gl.createShader(gl.VERTEX_SHADER);
	}else{
		return null;
	}
	var shaderText = getShaderText(shaderScript);
	//console.log(shaderText);

	gl.shaderSource(shader, shaderText);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		console.log(gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}

var shaderProgram;

function initShaderProgram(){
	shaderProgram = gl.createProgram();

	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
		console.log("could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPosAttr = gl.getAttribLocation(shaderProgram, "v");
	gl.enableVertexAttribArray(shaderProgram.vertexPosAttr);

	shaderProgram.textureCoordAttr = gl.getAttribLocation(shaderProgram, "t");
	gl.enableVertexAttribArray(shaderProgram.texture_coords);

	shaderProgram.PMatrix = gl.getUniformLocation(shaderProgram, "P");
	shaderProgram.MVMatrix = gl.getUniformLocation(shaderProgram, "MV");
	shaderProgram.sampler = gl.getUniformLocation(shaderProgram, "sampler");

}

var uniforms={
	PMatrix: mat4.create(),
	MVMatrix: mat4.create()
}

function setMatrixUniforms(){
	gl.uniformMatrix4fv(shaderProgram.PMatrix, false, uniforms.PMatrix);
	gl.uniformMatrix4fv(shaderProgram.MVMatrix, false, uniforms.MVMatrix);
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
};

function handleLoadedTexture(texture, image){
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

var tardisTexture;
function initTexture(){
	tardisTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tardisTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
              new Uint8Array([255, 0, 0, 255]));
	gl.bindTexture(gl.TEXTURE_2D, null);

	var image = new Image();
	image.src = document.getElementById("texture").src;
	image.onload = function() {
		handleLoadedTexture(tardisTexture, image);
	}
}

var buffers = {
	v : null,
	i : null,
	t : null
}

function initBuffers(){
	
	buffers.v = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.v);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	buffers.v.item_size = 3;
	buffers.v.num_items = 24;
	
	buffers.i = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.i);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indies), gl.STATIC_DRAW);
	buffers.i.item_size = 1;
	buffers.i.num_items = 36;

	buffers.t = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.t);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texture_coords), gl.STATIC_DRAW);
	buffers.t.item_size = 2;
	buffers.t.num_items = 24;
}

var rotationX = 0;
var rotationY = 0;
var rotationZ = 0;
var lastTime = 0;

function degToRad(degrees){
	return degrees*Math.PI/180;
}


function animate(){
	var timeNow = new Date().getTime();
	if (lastTime!=0){
		var elapsed = timeNow - lastTime;
		rotationX += (90 * elapsed) / 1000.0;
		rotationX = rotationX % 360;
		rotationY += (90 * elapsed) / 1000.0;
		rotationY = rotationY % 360;
		rotationZ += (90 * elapsed) / 1000.0;
		rotationZ = rotationZ % 360;
	}
	lastTime = timeNow;
}

function drawScene(){
	gl.viewport(0, 0, gl.viewPortWidth, gl.viewPortHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.perspective(45, gl.viewPortWidth/gl.viewPortHeight, 0.1, 100.0, uniforms.PMatrix);

	mat4.identity(uniforms.MVMatrix);

	mat4.translate(uniforms.MVMatrix, [0.0, 0.0, -7.0]);
	mat4.rotate(uniforms.MVMatrix, degToRad(rotationX), [1, 0, 0]);
	mat4.rotate(uniforms.MVMatrix, degToRad(rotationY), [0, 1, 0]);
	mat4.rotate(uniforms.MVMatrix, degToRad(rotationX), [0, 0, 1]);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.v);
	gl.vertexAttribPointer(shaderProgram.vertexPosAttr, 
							buffers.v.item_size,
							gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.t);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttr,
							buffers.t.item_size,
							gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tardisTexture);
	setMatrixUniforms();

	gl.uniform1i(shaderProgram.sampler, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.i);
	gl.drawElements(gl.TRIANGLES, buffers.i.num_items, gl.UNSIGNED_SHORT, 0);
}

function tick(){
	requestAnimationFrame(tick);
	drawScene();
	animate();
}

function webGLStart(){
	var canvas = document.getElementById("GLDRAW");
	initGL(canvas);
	initShaderProgram();
	initBuffers();
	initTexture();

	gl.clearColor(0.0, 0.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	tick();
}