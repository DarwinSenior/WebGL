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


	shaderProgram.normalAttr = gl.getAttribLocation(shaderProgram, "n");
	gl.enableVertexAttribArray(shaderProgram.normalAttr);

	shaderProgram.PMatrix = gl.getUniformLocation(shaderProgram, "P");
	shaderProgram.MVMatrix = gl.getUniformLocation(shaderProgram, "MV");
	shaderProgram.NMatrix = gl.getUniformLocation(shaderProgram, "N");
	shaderProgram.envsampler = gl.getUniformLocation(shaderProgram, "envSampler");
	shaderProgram.sampler = gl.getUniformLocation(shaderProgram, "sampler");
	shaderProgram.ambientColor = gl.getUniformLocation(shaderProgram, "ambient");
	shaderProgram.lightDirection = gl.getUniformLocation(shaderProgram, "light_direction");
	shaderProgram.reflectColor = gl.getUniformLocation(shaderProgram, "reflect");

}

var uniforms={
	PMatrix: mat4.create(),
	MVMatrix: mat4.create(),
	NMatrix: mat3.create()
}
var lightPara={
	ambient : [0.0, 0.0, 0.0], //R G B
	reflect : [1.0, 1.0, 1.0],
	direction : [0.0, 0.0, 1.0] //X Y Z
};

function setMatrixUniforms(){
	gl.uniformMatrix4fv(shaderProgram.PMatrix, false, uniforms.PMatrix);
	gl.uniformMatrix4fv(shaderProgram.MVMatrix, false, uniforms.MVMatrix);
	gl.uniformMatrix3fv(shaderProgram.NMatrix, false, uniforms.NMatrix);
}

function setLightUniforms(){
	gl.uniform3fv(shaderProgram.ambientColor, new Float32Array(lightPara.ambient));
	gl.uniform3fv(shaderProgram.lightDirection, new Float32Array(lightPara.direction));
	gl.uniform3fv(shaderProgram.reflectColor, new Float32Array(lightPara.reflect));
}

function handleLoadedTexture(texture, image){
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
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
	image.src = document.getElementById("maptexture").src;
	image.onload = function() {
		handleLoadedTexture(tardisTexture, image);
	}
}

var env_texture;
var TEXTURE_FACES;
function handleLoadedCubeTexture(texture, image, face){
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
}
var images = [];

var ready = 0;
function initCubeMap(){
	TEXTURE_FACES = [
		gl.TEXTURE_CUBE_MAP_POSITIVE_X, 
		gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Z 
		];
	env_texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, env_texture);
	for (var i=0; i<6; i++){
		gl.texImage2D(TEXTURE_FACES[i], 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
              new Uint8Array([255, 0, 0, 255]));
	}
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

	for (var i=0; i<6; i++){
		images[i] = new Image();
		images[i].src = document.getElementById("texture").src;
		images[i].onload = function(){
			ready += 1;
			if (ready===6){
				for (var j=0; j<6; j++){
					handleLoadedCubeTexture(env_texture, images[j], TEXTURE_FACES[j]);
				}
			}
		}
	}
}


var buffers = {};

function initBuffers(){
	
	buffers.v = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.v);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapot_data.vertices), gl.STATIC_DRAW);
	buffers.v.item_size = 3;
	buffers.v.num_items = teapot_data.vertices.length/3;
	
	buffers.i = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.i);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(teapot_data.indices), gl.STATIC_DRAW);
	buffers.i.item_size = 1;
	buffers.i.num_items = teapot_data.indices.length;


	buffers.n = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.n);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapot_data.normals), gl.STATIC_DRAW);
	buffers.n.item_size = 3;
	buffers.n.num_items = teapot_data.normals.length/3;

}


function updateLight(){
	lightPara.ambient = [
	parseFloat(document.getElementById("ambientR").value),
	parseFloat(document.getElementById("ambientG").value),
	parseFloat(document.getElementById("ambientB").value)
	];
	lightPara.direction = [
	parseFloat(document.getElementById("directionX").value),
	parseFloat(document.getElementById("directionY").value),
	parseFloat(document.getElementById("directionZ").value)
	];
	vec3.normalize(lightPara.direction);
	vec3.scale(lightPara.direction, -1);
	lightPara.reflect = [
	parseFloat(document.getElementById("reflectR").value),
	parseFloat(document.getElementById("reflectG").value),
	parseFloat(document.getElementById("reflectB").value)
	];
	console.log("finished");
}

var rotation={
	X : 0,
	Y : 0,
	Z : 0,
	v_X : 0,
	v_Y : 0
};
var lastTime = 0;

function degToRad(degrees){
	return degrees*Math.PI/180;
}


function animate(){
	var timeNow = new Date().getTime();
	if (lastTime!=0){
		var elapsed = timeNow - lastTime;
		rotation.X += (rotation.v_X * elapsed) / 1000.0;
		rotation.X = rotation.X % 360;
		rotation.Y += (rotation.v_Y * elapsed) / 1000.0;
		rotation.Y = rotation.Y % 360;
	}
	lastTime = timeNow;
}

function transformModel(){
	MVMatrix = uniforms.MVMatrix;
	NMatrix = uniforms.NMatrix;
	mat4.identity(MVMatrix);

	mat4.translate(MVMatrix, [0.0, 0.0, -12.0]);
	mat4.rotate(MVMatrix, degToRad(rotation.X), [1, 0, 0]);
	mat4.rotate(MVMatrix, degToRad(rotation.Y), [0, 1, 0]);
	mat4.rotate(MVMatrix, degToRad(rotation.Z), [0, 0, 1]);

	mat4.toInverseMat3(MVMatrix, NMatrix);
	mat3.transpose(NMatrix);
}

function drawScene(){
	gl.viewport(0, 0, gl.viewPortWidth, gl.viewPortHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.perspective(45, gl.viewPortWidth/gl.viewPortHeight, 0.1, 100.0, uniforms.PMatrix);

	transformModel();

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.v);
	gl.vertexAttribPointer(shaderProgram.vertexPosAttr, 
							buffers.v.item_size,
							gl.FLOAT, false, 0, 0);

	// gl.bindBuffer(gl.ARRAY_BUFFER, buffers.t);
	// gl.vertexAttribPointer(shaderProgram.textureCoordAttr,
	// 						buffers.t.item_size,
	// 						gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.n);
	gl.vertexAttribPointer(shaderProgram.normalAttr,
							buffers.n.item_size,
							gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE3);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, env_texture);
	gl.uniform1i(shaderProgram.envsampler, 3);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tardisTexture);
	gl.uniform1i(shaderProgram.sampler, 0);

	setMatrixUniforms();
	setLightUniforms();


	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.i);
	gl.drawElements(gl.TRIANGLES, buffers.i.num_items, gl.UNSIGNED_SHORT, 0);
}

var keyPressed = {};
var KEY = {
	UP : 38,
	DOWN : 40,
	LEFT : 37,
	RIGHT : 39
} 

function handleKeyUp(event){
	keyPressed[event.keyCode] = false;
}
function handleKeyDown(event){
	keyPressed[event.keyCode] = true;
}

function handleKeys(){
	if (keyPressed[KEY.UP]){
		rotation.v_X -= 1;
	}
	if (keyPressed[KEY.DOWN]){
		rotation.v_X += 1;
	}
	if (keyPressed[KEY.LEFT]){
		rotation.v_Y -= 1;
	}
	if (keyPressed[KEY.RIGHT]){
		rotation.v_Y += 1;
	}
}

function tick(){
	requestAnimationFrame(tick);
	handleKeys();
	drawScene();
	animate();
}



function webGLStart(){
	var canvas = document.getElementById("GLDRAW");
	initGL(canvas);
	initShaderProgram();
	initBuffers();
	initTexture();
	initCubeMap();

	document.onkeyup = handleKeyUp;
	document.onkeydown = handleKeyDown;
	document.getElementById("submit_button").addEventListener("click", updateLight);

	gl.clearColor(0.0, 0.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	tick();
}