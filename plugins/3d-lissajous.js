// Lissajous plugin

// This program is licensed under the MIT License.
// Copyright 2014, aike (@aike1000)

$(function() {

var Lissajous = function(n) {
	this.description = 
		"Lissajous\n"
		+ "  3D lissajous figure plugin\n"
		+ "  Audio affects figure size\n";

	this.thumbnail = '3d-lissajous.png';

    this.id = '#lissajous' + n;
	var elem = $('<div>')
		.attr({id: 'lissajous' + n})
		.css({
			position: 'absolute',
			margin:0,
			padding:0,
			backgroundColor:'transparent'
		})
		.appendTo('#jsdrome');
	this.div = elem[0];

	this.makeStage();

	this.angle = 0;
	this.ratio1 = 2;
	this.ratio2 = 4;
	this.ratiocnt = 0;
	this.ratioadd = 1;
	this.speed1 = 1;
	this.speed2 = 1;

	this.boost = 0;
	this.up = 0;
}

Lissajous.prototype.makeStage = function() {
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


Lissajous.prototype.onStart = function() {
	$(this.id).css({display: 'block'});
	this.baseTime = +new Date;
}

Lissajous.prototype.onStop = function() {
	$(this.id).css({display: 'none'});
}

Lissajous.prototype.onFade = function(opa) {
    $(this.id).css({opacity: opa});
}

Lissajous.prototype.render = function() {
	var self = this;

	this.angle += 0.1;
	this.ratiocnt++;
	if (this.ratiocnt > 400) {
		this.ratiocnt = 0;

		if (Math.random() < 0.5) {
			if (this.ratio1 === 6)
				this.ratio1 = 5;
			else if (this.ratio1 === 1)
				this.ratio1 = 2;
			else
				this.ratio1 += Math.random() < 0.5 ? 1 : -1;
			this.speed1 = Math.random() + this.up * 1.5;
		} else {
			if (this.ratio2 === 4)
				this.ratio2 = 3;
			else if (this.ratio2 === 1)
				this.ratio2 = 2;
			else
				this.ratio2 += Math.random() < 0.5 ? 1 : -1;
			this.speed2 = Math.random() + this.up * 2;
		}
	}

	var as1 = this.angle * this.speed1;
	var ratio1 = this.ratio1;
	var boost = this.boost * 0.7 + 0.1;
	var mat1 = new THREE.LineBasicMaterial( { linewidth: 2, color: 0xcccc88 } );
	var geo1 = new THREE.Geometry();
	for (var i = 0; i < 2 * Math.PI + 0.1; i += 0.05) {
		geo1.vertices.push(new THREE.Vector3(
			Math.sin(i) * 1.5,
			0 + Math.cos(i) * 0.1 + Math.sin(i * ratio1 + as1) * boost,
			-2 + Math.cos(i) * 1.5));
	}
	var mesh1 = new THREE.Line(geo1, mat1);
	this.scene.remove(this.mesh1);
	this.scene.add(mesh1);
	this.mesh1 = mesh1;

	var as2 = this.angle * this.speed2;
	var ratio2 = this.ratio2;
	var up = this.up;
	var mat2 = new THREE.LineBasicMaterial( { linewidth: 2, color: 0xee6644 } );
	var geo2 = new THREE.Geometry();
	for (var i = 0; i < 2 * Math.PI + 0.1; i += 0.05) {
		geo2.vertices.push(new THREE.Vector3(
			Math.sin(i) * 0.4,
			0 + Math.cos(i) * 0.1 + Math.sin(i * ratio2 + as2) * 0.2 + up,
			-2 + Math.cos(i) * 0.4));
	}
	var mesh2 = new THREE.Line(geo2, mat2);
	this.scene.remove(this.mesh2);
	this.scene.add(mesh2);
	this.mesh2 = mesh2;

	this.renderer.render(this.scene, this.camera);
}

Lissajous.prototype.onTimer = function() {
	this.render();
}

Lissajous.prototype.onKeydown = function(key) {
}

Lissajous.prototype.onAudio = function(moment, period) {
//	this.camera.position = new THREE.Vector3(0, 0, 12 - 4 * moment);
	this.boost = moment;
	this.up = period;
}

Lissajous.prototype.onResize = function(x, y, width, height) {
	$(this.id).css({left: x, top: y});
	this.camera.aspect = width / height;
	this.camera.updateProjectionMatrix();
	this.renderer.setSize(width, height);
}

Lissajous.prototype.onMidi = function(a1, a2, a3) {
}

app.addPlugin(0, new Lissajous(0));
app.addPlugin(1, new Lissajous(1));

});
