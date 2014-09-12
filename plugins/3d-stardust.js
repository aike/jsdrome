$(function() {
//　based on http://threejs.org/examples/webgl_particles_random.html

var Stardust = function(n) {
	// 初期化
	//this.container = document.createElement('div');

	// mode: 0  slow zoom out
	// mode: 1  rotation
	// mode: 2  fast zoom in
	// mode: 3  rotation

    this.description = 
        "Stardust\n"
        + "  3D stardust graphics plugin\n"
        + "  Audio changes color\n";

	this.thumbnail = '3d-stardust.png';

    this.id = '#stardust' + n;

	this.mode = 0;

	this.col = 1;
	this.colchange = false;
	this.pasttime = false;

	this.delta = {x:0, y:0.0035, z:0};
	this.pause = true;

	var elem = $('<div>')
		.attr({id: 'stardust' + n})
		.css({
			position: 'absolute',
			margin:0,
			padding:0,
			backgroundColor:'transparent'
		})
		.appendTo('#jsdrome');
	this.container = elem[0];

	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
	this.camera.position.z = 1000; //pull this back to 2000 to see what is actually going on

	this.scene = new THREE.Scene();
	this.scene.fog = new THREE.FogExp2( this.colcode(this.col), 0.0009 );  //color of fog - objects are all white
	var geometry = new THREE.Geometry();

	for (i = 0; i < 10000; i ++) //total objects within each particle object
	{ //-1000 is for centering on screen, span would be -1000 to 1000
		var vertex = new THREE.Vector3();
		vertex.x = Math.random()*2000-1000;
		vertex.y = Math.random()*2000-1000;
		vertex.z = Math.random()*2000-1000;
		geometry.vertices.push( vertex );
	}

	//repeating similar code for each "Particle object" I want --- can add for loop
	var material = new THREE.ParticleBasicMaterial( { size: 4 });
	var particles = new THREE.ParticleSystem( geometry, material );
	particles.rotation.x = Math.random() * 6;
	particles.rotation.y = Math.random() * 6;
	particles.rotation.z = Math.random() * 6;
	this.scene.add( particles ); 

	var material = new THREE.ParticleBasicMaterial( { size: 3 });
	var particles = new THREE.ParticleSystem( geometry, material );
	particles.rotation.x = Math.random() * 6;
	particles.rotation.y = Math.random() * 6;
	particles.rotation.z = Math.random() * 6;
	this.scene.add( particles ); 

	var material = new THREE.ParticleBasicMaterial( { size: 5 });
	var particles = new THREE.ParticleSystem( geometry, material );
	particles.rotation.x = Math.random() * 6;
	particles.rotation.y = Math.random() * 6;
	particles.rotation.z = Math.random() * 6;
	this.scene.add( particles ); 

	var material = new THREE.ParticleBasicMaterial( { size: 5 });
	var particles = new THREE.ParticleSystem( geometry, material );
	particles.rotation.x = Math.random() * 6;
	particles.rotation.y = Math.random() * 6;
	particles.rotation.z = Math.random() * 6;
	this.scene.add( particles ); 

	var material = new THREE.ParticleBasicMaterial( { size: 5 });
	var particles = new THREE.ParticleSystem( geometry, material );
	particles.rotation.x = Math.random() * 6;
	particles.rotation.y = Math.random() * 6;
	particles.rotation.z = Math.random() * 6;
	this.scene.add( particles ); 

	var material = new THREE.ParticleBasicMaterial( { size: 5 });
	var particles = new THREE.ParticleSystem( geometry, material );
	particles.rotation.x = Math.random() * 6;
	particles.rotation.y = Math.random() * 6;
	particles.rotation.z = Math.random() * 6;
	this.scene.add( particles ); 


	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize(window.innerWidth, window.innerHeight);
	this.container.appendChild( this.renderer.domElement );

}

////////////////////////////////////////////////////////////////

Stardust.prototype.colcode = function(n) {
	var r = 0;
	if (n & 1)
		r += 0xF0;
	if (n & 2)
		r += 0xF000;
	if (n & 4)
		r += 0xF00000;
	return r;
}


Stardust.prototype.onStart = function() {
	$(this.id).css({display: 'block'});

	this.pause = false;
}

Stardust.prototype.render = function() {
	if (this.pause)
		return;

//	var self = this;
//	requestAnimationFrame( function() {self.render();} );	// functionでくくるかも
	for ( i = 0; i < this.scene.children.length; i ++ ) {
		var object = this.scene.children[ i ];
		if ( object instanceof THREE.ParticleSystem ) {
//			object.rotation.y += .0035;
			object.rotation.x += 0;//this.delta.x;
			object.rotation.y += 0;//this.delta.y;
			object.rotation.z += 0;//this.delta.z;
		}
	}

	var p;
	switch (this.mode) {
		case 0:
			this.camera.rotation.z += 0;
			this.camera.position.z += 0.5;
			if (this.camera.position.z > 1700)
				this.mode = 1;
			break;
		case 1:
			this.camera.rotation.z += 0.003;
			this.camera.position.z -= 0.2;
			if (this.camera.rotation.z > 3)
				this.mode = 2;
			break;
		case 2:
			this.camera.rotation.z += 0;
			p = (1700 - this.camera.position.z) / (1700 + 500);
			this.camera.position.z += -1 + (p * -5);
			if (this.camera.position.z < -500)
				this.mode = 3;
			break;
		case 3:
			this.camera.rotation.z -= 0.003;
			this.camera.position.z += 0.001;
			if (this.camera.rotation.z <= 0)
				this.mode = 0;
			break;
	}
//console.log(this.camera.position.z);

	if (!this.pause) {
		this.renderer.render( this.scene, this.camera );
	}
}



Stardust.prototype.onStop = function() {
	$(this.id).css({display: 'none'});
	clearInterval(this.timer);
	this.pause = true;
}

Stardust.prototype.onFade = function(opa) {
    $(this.id).css({opacity: opa});
}

Stardust.prototype.onAudio = function(moment, period) {
//	this.camera.position.z = 1000 - Math.floor(period * 20);
	if (this.colchange && this.pasttime && (moment > 0.2)) {
		this.col += 1;
		if (this.col > 6)
			this.col = 0;
		this.scene.fog = new THREE.FogExp2( this.colcode(this.col), 0.0009 );  //color of fog - objects are all white
		this.pasttime = false;
	}
}

Stardust.prototype.onKeydown = function(key) {

	switch (key) {
	case 68: // D
		this.col += 1;
		if (this.col > 6)
			this.col = 0;
		break;
	case 67: // C
		this.col -= 1;
		if (this.col < 0)
			this.col = 6;
		break;
	case 32: // Space
		this.colchange = ! this.colchange;
		break;
	}

	this.scene.fog = new THREE.FogExp2( this.colcode(this.col), 0.0009 );  //color of fog - objects are all white
}

// temporary
/*
window.addEventListener('keydown',
	function(e) {
		pause = ! pause;
	});
*/

Stardust.prototype.onResize = function(x, y, width, height) {
	$(this.id).css({left: x, top: y});
//	$(this.id + ' canvas').css({left: x, top: y});

	this.camera.aspect = width / height;
	this.camera.updateProjectionMatrix();
	this.renderer.setSize(width, height);
}

Stardust.prototype.onTimer = function() {
	this.render();
}

Stardust.prototype.onMidi = function(a1, a2, a3) {
}

app.addPlugin(0, new Stardust(0));
app.addPlugin(1, new Stardust(1));


});