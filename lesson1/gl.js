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
	console.log(shaderText);

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

	shaderProgram.PMatrix = gl.getUniformLocation(shaderProgram, "P");
	shaderProgram.MVMatrix = gl.getUniformLocation(shaderProgram, "MV");

}

var uniforms={
	PMatrix: mat4.create(),
	MVMatrix: mat4.create()
}

function setMatrixUniforms(){
	gl.uniformMatrix4fv(shaderProgram.PMatrix, false, uniforms.PMatrix);
	gl.uniformMatrix4fv(shaderProgram.MVMatrix, false, uniforms.MVMatrix);
}

var buffers = {
	triangle_vbuffer : null
}

function initBuffers(){
	buffers.triangle_vbuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.triangle_vbuffer);
	var vertices = [
		0.0, 1.0, 0.0,
		-1.0, -1.0, 0.0,
		1.0, -1.0, 0.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	buffers.triangle_vbuffer.item_size = 3;
	buffers.triangle_vbuffer.num_items = 3;
}

function drawScene(){
	gl.viewport(0, 0, gl.viewPortWidth, gl.viewPortHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.perspective(45, gl.viewPortWidth/gl.viewPortHeight, 0.1, 100.0, uniforms.PMatrix);

	mat4.identity(uniforms.MVMatrix);

	mat4.translate(uniforms.MVMatrix, [-1.5, 0.0, -7.0]);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.triangle_vbuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPosAttr, 
							buffers.triangle_vbuffer.item_size,
							gl.FLOAT, false, 0, 0);
	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLES, 0, buffers.triangle_vbuffer.num_items);
}

function webGLStart(){
	var canvas = document.getElementById("GLDRAW");
	initGL(canvas);
	initShaderProgram();
	initBuffers();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	drawScene();
}