// Wave plugin

// This program is licensed under the MIT License.
// Copyright 2014, aike (@aike1000)

$(function() {

var Wave = function(n, app) {
	this.description = 
		"Wave\n"
		+ "  3D wireframe spectrum graphic plugin\n"
		+ "  Audio affects wireframe form\n"
		+ "  [D][C] spectrum/wave form\n";

	this.thumbnail = '3d-wave.png';

    this.id = '#wave' + n;
	var elem = $('<div>')
		.attr({id: 'wave' + n})
		.css({
			position: 'absolute',
			margin:0,
			padding:0,
			backgroundColor:'transparent'
		})
		.appendTo('#jsdrome');
	this.div = elem[0];

	this.app = app;

	this.makeStage(false);

	this.data = new RingBuffer(20);
	for (var i = 0; i < 20; i++)
		this.data.set(new Uint8Array(512));
	this.mesh = new Array(20);

	this.n = 0;
	this.count = 0;
	this.mode = 0;

	this.angle = 0;
	this.angle2 = Math.random() * Math.PI * 2;
	this.angle3 = 0;
	this.brightness = 0.8;

	for (var i = 0; i < 20; i++) {
		var m = this.drawLine(i, true);
		this.scene.add(m);

		for (var j = 0; j < i; j++) {
			this.mesh[j].position.z += 1.0;
			this.mesh[j].position.y -= 0.15;
		}
	}

}

Wave.prototype.makeStage = function(showGround) {
	this.renderer = new THREE.WebGLRenderer({ antialias:true });
	this.renderer.setSize(300, 200);
	this.renderer.setClearColor(0x040408, 0);
	this.div.appendChild(this.renderer.domElement);
 
	this.scene = new THREE.Scene();
	this.scene.fog = new THREE.FogExp2( 0x000000, 0.05 );

	this.camera = new THREE.PerspectiveCamera(15, 500 / 500);
	this.camera.position = new THREE.Vector3(0, 0, 8);
	this.camera.lookAt(new THREE.Vector3(0, 0, 0));
	this.scene.add(this.camera);

	this.ambient = new THREE.AmbientLight(0x212832);
	this.scene.add(this.ambient);

	var slight = new THREE.SpotLight(0xffffff);
	slight.position.set(0, 50, -2);
	slight.angle = Math.PI / 4 * 0.1;
	this.scene.add(slight);
	slight.castShadow = true;
	slight.shadowDarkness = 0.5;

	if (showGround) {
		var ground = new THREE.Mesh(
			new THREE.PlaneGeometry(1000, 1000),
			new THREE.MeshPhongMaterial({color: 0x040408})
		);
		ground.rotation.x = Math.PI / -2 * 0.99;
		ground.position.y = -1;
		ground.receiveShadow = true;
		this.scene.add(ground);
	    slight.target = ground;
	}

	this.renderer.shadowMapEnabled = true;
	this.renderer.shadowMapSoft = true;
}


Wave.prototype.onStart = function() {
	$(this.id).css({display: 'block'});
	this.baseTime = +new Date;
}

Wave.prototype.onStop = function() {
	$(this.id).css({display: 'none'});
}

Wave.prototype.onFade = function(opa) {
    $(this.id).css({opacity: opa});
}

Wave.prototype.render = function() {
	this.count++;
	if (this.count < 2)
		return;
	this.count = 0;

	this.angle += 0.01;
	if (this.angle >= Math.PI * 2)
		this.angle = 0;
	this.camera.position.x = Math.sin(this.angle) * 2;

	this.angle2 += 0.0002;
	if (this.angle2 >= Math.PI * 2)
		this.angle2 = 0;

	this.angle3 += 0.00053;
	if (this.angle3 >= Math.PI * 2)
		this.angle3 = 0;
	this.camera.rotation.z = Math.sin(this.angle3) / 4;

    if(this.mode === 0)
    	this.app.analyser.getByteFrequencyData(this.data.get(this.n)); //Spectrum Data
    else
    	this.app.analyser.getByteTimeDomainData(this.data.get(this.n)); //Waveform Data

	for (var i = 0; i < 20; i++) {
		var m = this.mesh[i];
		if (m) {
			m.position.z += 1.0;
			m.position.y -= 0.15;
			if (m.position.z > 0.0) {
				this.scene.remove(m);
				m = this.drawLine(i, false);
				this.scene.add(m);
			}
		}
	}

	this.renderer.render(this.scene, this.camera);
}

Wave.prototype.drawLine = function(n, nodata) {

	if (nodata) {
		for (var i = 0; i < 512; i ++) {
				this.data.get(0)[i] = 0;
		}
	}

	var mat = new THREE.LineBasicMaterial( { linewidth: 1 } );
	mat.color.setHSL(this.angle2, 0.7, this.brightness);
	var geo = new THREE.Geometry();
	geo.vertices.push(new THREE.Vector3(
		-4 + (-500) * 0.02,
		- 0.8,
		-7 + (-500) * 0.05));
	geo.vertices.push(new THREE.Vector3(
		-4 + (-1) * 0.02,
		- 0.8,
		-7 + (-1) * 0.05));
	for (var i = 0; i < 512; i ++) {
		geo.vertices.push(new THREE.Vector3(
			-4 + i * 0.02,
			this.data.get(0)[i] * 0.01 - 0.8,
			-7 + i * 0.05));
	}
	this.mesh[n] = new THREE.Line(geo, mat);
	this.mesh[n].position.z = -19;
	this.mesh[n].position.y = 1.0;

	return this.mesh[n];
}


Wave.prototype.onTimer = function() {
	this.render();
}

Wave.prototype.onKeydown = function(key) {
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
}

Wave.prototype.onAudio = function(moment, period) {
	this.brightness = (0.4 + moment * 0.6) / 2 + 0.4;
}

Wave.prototype.onResize = function(x, y, width, height) {
	$(this.id).css({left: x, top: y});
	this.camera.aspect = width / height;
	this.camera.updateProjectionMatrix();
	this.renderer.setSize(width, height);
}

Wave.prototype.onMidi = function(a1, a2, a3) {
}

app.addPlugin(0, new Wave(0, app));
app.addPlugin(1, new Wave(1, app));

});
