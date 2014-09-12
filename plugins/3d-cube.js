// Cube plugin

// This program is licensed under the MIT License.
// Copyright 2014, aike (@aike1000)

$(function() {

var Cube = function(n) {
	this.description = 
		"Cube\n"
		+ "  3D cube plugin\n"
		+ "  Audio affects cube size\n"
		+ "  [D][C] move/stop\n";

	this.thumbnail = '3d-cube.png';

	this.texture1 = [
		config.root + 'images/cube1-1.png',
		config.root + 'images/cube1-6.png',
		config.root + 'images/cube1-3.png',
		config.root + 'images/cube1-4.png',
		config.root + 'images/cube1-5.png',
		config.root + 'images/cube1-2.png'
	];

	this.texture2 = [
		config.root + 'images/cube2.png',
	];

    this.id = '#cube' + n;
	var elem = $('<div>')
		.attr({id: 'cube' + n})
		.css({
			position: 'absolute',
			margin:0,
			padding:0,
			backgroundColor:'transparent'
		})
		.appendTo('#jsdrome');
	this.div = elem[0];

	this.makeStage();


	this.mode = 0;
	this.zpos = -1;

	var material1, material2;
	if (this.texture1.length === 6) {
		material1 = new THREE.MeshFaceMaterial([
			new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(this.texture1[0])}),
			new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(this.texture1[1])}),
			new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(this.texture1[2])}),
			new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(this.texture1[3])}),
			new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(this.texture1[4])}),
			new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(this.texture1[5])})
		]);
	} else {
		material1 = new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture(this.texture1[0]) });
	}

	if (this.texture2.length === 6) {
		material2 = new THREE.MeshFaceMaterial([
			new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(this.texture2[0])}),
			new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(this.texture2[1])}),
			new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(this.texture2[2])}),
			new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(this.texture2[3])}),
			new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(this.texture2[4])}),
			new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(this.texture2[5])})
		]);
	} else {
		material2 = new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture(this.texture2[0]) });
	}
	this.geometry1 = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2, material1);
	this.geometry2 = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2, material2);

	this.mesh1 = new THREE.Mesh(this.geometry1, material1);
	this.mesh2 = new THREE.Mesh(this.geometry2, material2);

	if (this.mode === 0) {
		this.mesh1.position.x = -1.2;
		this.mesh1.position.z = this.zpos;
		this.mesh2.position.x = 1.2;
		this.mesh2.position.z = this.zpos;
	}

	this.scene.add(this.mesh1);
	this.scene.add(this.mesh2);
    this.mesh1.castShadow = true;
    this.mesh2.castShadow = true;
}

Cube.prototype.makeStage = function() {
	this.renderer = new THREE.WebGLRenderer({ antialias:true });
//	this.renderer.setSize(300, 200);
	this.renderer.setSize(300, 200);
	this.width = 300;
	this.height = 200;
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
	this.scene.add(ground);

    var slight = new THREE.SpotLight(0xffffff);
    slight.position.set(0, 50, -2);
    slight.angle = Math.PI / 4 * 0.1;
    slight.target = ground;
    this.scene.add(slight);

    ground.receiveShadow = true;
    slight.castShadow = true;
	slight.shadowDarkness = 0.5;
	this.renderer.shadowMapEnabled = true;
	this.renderer.shadowMapSoft = true;
}

Cube.prototype.onStart = function() {
	$(this.id).css({display: 'block'});
	this.baseTime = +new Date;
}

Cube.prototype.onStop = function() {
	$(this.id).css({display: 'none'});
}

Cube.prototype.onFade = function(opa) {
    $(this.id).css({opacity: opa});
}

Cube.prototype.render = function() {
	var self = this;
	var n = +new Date - this.baseTime;
	this.mesh1.rotation.y = 1 * n / 1000;
	this.mesh1.rotation.x = 0.5 * n / 1000;
	this.mesh2.rotation.y = 0.5 * n / 1000;
	this.mesh2.rotation.x = 1 * n / 1000;

	var p2 = Math.PI * 2;
	if (this.mode === 1) {

		this.mesh1.position.x = 1.5 * Math.sin(n / 1000);
		this.mesh1.position.z = 1.5 * Math.cos(n / 1000) + this.zpos;

		this.mesh2.position.x = 1.5 * Math.sin(n / 1000 + Math.PI);
		this.mesh2.position.z = 1.5 * Math.cos(n / 1000 + Math.PI) + this.zpos;
	}

	this.renderer.render(this.scene, this.camera);
}

Cube.prototype.onTimer = function() {
	this.render();
}

Cube.prototype.onKeydown = function(key) {
	switch (key) {
	case 68: // D
		this.mode += 1;
		if (this.mode > 1)
			this.mode = 0;
		break;
	case 67: // C
		this.mode -= 1;
		if (this.mode < 0)
			this.mode = 1;
		break;
	}
	if (this.mode === 0) {
		this.mesh1.position.x = -1.2;
		this.mesh1.position.z = this.zpos;
		this.mesh2.position.x = 1.2;
		this.mesh2.position.z = this.zpos;
	}
}

Cube.prototype.onAudio = function(moment, period) {
//	this.camera.position = new THREE.Vector3(0, 0, 12 - 4 * moment);//カメラの位置
}

Cube.prototype.onResize = function(x, y, width, height) {
	$(this.id).css({left: x, top: y, width: width, height: height});

//console.log(width + ' ' + height);

var self = this;
setTimeout(function() {
	self.camera.aspect = width / height;
//	self.camera.fov = 50;
//	self.camera.lookAt(new THREE.Vector3(0, 0, 0));
//	self.camera.position = new THREE.Vector3(3, 2, 8);
	self.camera.updateProjectionMatrix();
/*
	var diffx = width - this.width;
	var diffy = width - this.width;
	var dx = Math.floor(diffx / 100);
	var dy = Math.floor(diffy / 100);
	for (var i = 0; i < diffx; i += 100) {
		self.renderer.setSize(this.width + i * dx, this.height + i * dy);
	}
*/
	self.renderer.setSize(width, height);
	self.render();
}, 100);
/*
	this.camera.aspect = width / height;
	this.camera.updateProjectionMatrix();
	this.renderer.setSize(width, height);
*/
}

Cube.prototype.onMidi = function(a1, a2, a3) {
}

app.addPlugin(0, new Cube(0));
app.addPlugin(1, new Cube(1));

});
