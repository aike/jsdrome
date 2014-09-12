// Matrix plugin

// This program is licensed under the MIT License.
// Copyright 2014, aike (@aike1000)

$(function() {

var Matrix = function(n) {
	this.description = 
		"Matrix\n"
		+ "  3D Matrix plugin\n";

	this.thumbnail = '3d-matrix.png';

    this.id = '#matrix' + n;
	var elem = $('<div>')
		.attr({id: 'matrix' + n})
		.css({
			position: 'absolute',
			margin:0,
			padding:0,
			backgroundColor:'transparent'
		})
		.appendTo('#jsdrome');
	this.div = elem[0];

	this.makeStage();

	// particle
	var n = 15;
	var wid = 1.0;
	var geometry = new THREE.Geometry();
	var numParticles = n * n * n;
	for (var x = 0; x < n; x++) {
		for (var y = 0; y < n; y++) {
			for (var z = 0; z < n; z++) {
				geometry.vertices.push(new THREE.Vector3(
					-7.5 + x * wid,
					-7.5 + y * wid,
					-2 - z * 2
				));
			}
		}
	}

	// line
	var mat = new THREE.LineBasicMaterial( { linewidth: 1, color: 0x4444dd } );
	var geo = new THREE.Geometry();
	for (var x = 0; x < n; x++) {
		for (var y = 0; y < n; y++) {
			for (var z = 0; z < n; z++) {
				geo.vertices.push(new THREE.Vector3(
					-7.5 + x * wid,
					-7.5 + y * wid,
					-2 - z * 2));
				geo.vertices.push(new THREE.Vector3(
					-7.5 + (x + 1) * wid,
					-7.5 + y * wid,
					-2 - z * 2));
				geo.vertices.push(new THREE.Vector3(
					-7.5 + (x + 1)* wid,
					-7.5 + (y + 1) * wid,
					-2 - z * 2));
				geo.vertices.push(new THREE.Vector3(
					-7.5 + x * wid,
					-7.5 + (y + 1) * wid,
					-2 - z * 2));
				geo.vertices.push(new THREE.Vector3(
					-7.5 + x * wid,
					-7.5 + y * wid,
					-2 - z * 2));
				geo.vertices.push(new THREE.Vector3(
					-7.5 + x * wid,
					-7.5 + y * wid,
					-2 - (z + 1) * 2));
			}
			geo.vertices.push(new THREE.Vector3(
				-7.5 + x * wid,
				-7.5 + (y + 1) * wid,
				-2 - (z + 1) * 2));
			geo.vertices.push(new THREE.Vector3(
				-7.5 + x * wid,
				-7.5 + (y + 1) * wid,
				-2 - 0 * 2));
		}
		geo.vertices.push(new THREE.Vector3(
			-7.5 + (x + 1) * wid,
			-7.5 + (y + 1) * wid,
			-2 - (z + 1) * 2));
		geo.vertices.push(new THREE.Vector3(
			-7.5 + (x + 1) * wid,
			-7.5 + (y + 1) * wid,
			-2 - 0 * 2));
		geo.vertices.push(new THREE.Vector3(
			-7.5 + (x + 1) * wid,
			-7.5 + 0 * wid,
			-2 - 0 * 2));
	}

	this.mesh1 = new THREE.Line(geo, mat);
	this.scene.add(this.mesh1);

	 
	// particle
	var texture =THREE.ImageUtils.loadTexture(config.root + 'images/particle.png');
	var material = new THREE.ParticleBasicMaterial({
	  size: 0.3, color: 0xff8888, blending: THREE.AdditiveBlending,
	  transparent: true, depthTest: false, map: texture});

	this.xpos = 0;
	this.ypos = 0;
	this.zpos = 0;
	this.mesh = new THREE.ParticleSystem(geometry, material);
	this.mesh.position = new THREE.Vector3(this.xpos, this.ypos, this.zpoz);
	this.mesh.sortParticles = false;

	this.index = this.scene.children.length;
	this.scene.add(this.mesh);

	this.cnt = 0;
	this.addx = 0;
	this.addy = 0;
	this.addz = 0.25;
	this.rotz = 0;
	this.rotaddz = 0;

	this.mode = 0;
}

Matrix.prototype.render = function() {

	this.cnt++;
	if (this.cnt > 200) {
		this.cnt = 0;

		if (this.addx === 0) {
			this.addx = Math.random() < 0.8 ? 0 : Math.random() * 0.04 + 0.005;
			this.addx *= Math.random() < 0.5 ? 1 : -1;
		}

		if (this.addy === 0) {
			this.addy = Math.random() < 0.8 ? 0 : Math.random() * 0.04 + 0.005;
			this.addy *= Math.random() < 0.5 ? 1 : -1;
		}

		if (this.rotaddz === 0) {
			this.rotaddz = Math.random() < 0.5 ? 0 : Math.random() * 0.01 + 0.005;
			this.rotaddz *= Math.random() < 0.5 ? 1 : -1;
		}
	}

	if (this.addx !== 0) {
		this.xpos += this.addx;
		if ((this.xpos <= 0) || (this.xpos >= 2)) {
			this.xpos = 1;
			this.addx = Math.random() < 0.3 ? 0 : this.addx;
		}
	}

	if (this.addy !== 0) {
		this.ypos += this.addy;
		if ((this.ypos <= 0) || (this.ypos >= 2)) {
			this.ypos = 1;
			this.addy = Math.random() < 0.3 ? 0 : this.addy;
		}
	}

	this.zpos += this.addz;
	if (this.zpos >= 8)
		this.zpos = 6;

	this.scene.children[this.index - 1].position.x =  this.xpos;
	this.scene.children[this.index - 1].position.y =  this.ypos;
	this.scene.children[this.index - 1].position.z =  this.zpos;

	this.scene.children[this.index].position.x =  this.xpos;
	this.scene.children[this.index].position.y =  this.ypos;
	this.scene.children[this.index].position.z =  this.zpos;

	if (this.rotaddz !== 0) {
		this.rotz += this.rotaddz;
		var p2 = Math.PI / 2;
		if ((this.rotz >= p2) || (this.rotz <= -p2)) {
			this.rotz = 0;
			this.rotaddz = 0;
		}
		this.scene.children[this.index - 1].rotation.z = this.rotz;
		this.scene.children[this.index].rotation.z = this.rotz;
	}

	this.renderer.render(this.scene, this.camera);
}



Matrix.prototype.makeStage = function() {
	this.renderer = new THREE.WebGLRenderer({ antialias:true });
	this.renderer.setSize(300, 200);
	this.renderer.setClearColor(0x080815, 0);
	this.div.appendChild(this.renderer.domElement);
 
	this.scene = new THREE.Scene();
	this.scene.fog = new THREE.FogExp2( 0x000000, 0.05 );

	this.camera = new THREE.PerspectiveCamera(15, 500 / 500);
	this.camera.position = new THREE.Vector3(0, 0, 8);
	this.camera.lookAt(new THREE.Vector3(0, 0, 0));
	this.scene.add(this.camera);

	this.ambient = new THREE.AmbientLight(0x212832);
	this.scene.add(this.ambient);

	var ground = new THREE.Mesh(
		new THREE.PlaneGeometry(1000, 1000),
		new THREE.MeshPhongMaterial({color: 0x040408})
	);
	ground.rotation.x = Math.PI / -2 * 0.99;
	ground.position.y = -1;
//	this.scene.add(ground);

    var slight = new THREE.SpotLight(0xffffff);
    slight.position.set(0, 50, -2);
    slight.angle = Math.PI / 4 * 0.1;
//    slight.target = ground;
    this.scene.add(slight);

//    ground.receiveShadow = true;
//    slight.castShadow = true;
//	slight.shadowDarkness = 0.5;
//	this.renderer.shadowMapEnabled = true;
//	this.renderer.shadowMapSoft = true;
}


Matrix.prototype.onStart = function() {
	$(this.id).css({display: 'block'});
	this.baseTime = +new Date;
}

Matrix.prototype.onStop = function() {
	$(this.id).css({display: 'none'});
}

Matrix.prototype.onFade = function(opa) {
    $(this.id).css({opacity: opa});
}

Matrix.prototype.onTimer = function() {
	this.render();
}

Matrix.prototype.onKeydown = function(key) {
}

Matrix.prototype.onAudio = function(moment, period) {
}

Matrix.prototype.onResize = function(x, y, width, height) {
	$(this.id).css({left: x, top: y});
	this.camera.aspect = width / height;
	this.camera.updateProjectionMatrix();
	this.renderer.setSize(width, height);
}

Matrix.prototype.onMidi = function(a1, a2, a3) {
}

app.addPlugin(0, new Matrix(0));
app.addPlugin(1, new Matrix(1));

});
