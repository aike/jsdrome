// Logo plugin

// This program is licensed under the MIT License.
// Copyright 2014, aike (@aike1000)

$(function() {

var Logo = function(text) {
	this.description = 
		"Logo\n"
		+ "  Show text logo common plugin\n"
		+ "  Audio affects logo size\n"
		+ "  [L] logo show/rotation/hide\n";

	this.id = "#logo";
	this.div = $('<div>')
		.attr({id: 'logo'})
		.css({
			position: 'absolute',
			margin:0,
			padding:0,
			backgroundColor:'transparent',
			color: '#ffffff',
			fontFamily: '"Papyrus",sans-serif',
			fontWeight: 900,
			opacity: 0.7,
			zIndex: 200,
			display: 'none'
		})
		.appendTo('#jsdrome');

	this.mode = 0;  // 0:hide  1:show  2:rotation

	this.text = text;
	this.div.text(this.text);


	this.threshold = 0.4;
	this.sensitivity = 4;


	this.height = 300;
	this.width = 400;
	this.x = 0;
	this.y = 0;
	this.halfw = this.width / 2;
	this.halfh = this.height / 2;
	this.size = this.width / 20;
	this.zoom = 1.0;
	this.opa = 0.7;

	this.deg = 360;

	this.moveX = false;
	this.moveY = false;
	this.moveZ = false;

	this.dirX = 1;
	this.dirY = 1;
	this.dirZ = 1;

	this.draw();
}

Logo.prototype.toggle = function() {
	switch (this.mode) {
		case 0:
			this.div.css({ display: 'block', opacity: this.opa });
			this.div
			.css({
				transform: 'rotateX(0) rotateY(0) rotateZ(0)',
				opacity: this.opa
			})
			this.mode = 1;
			break;
		case 1:
			this.deg = 360;
			this.mode = 2;
			break;
		case 2:
			this.div.css({ display: 'none'});
			this.mode = 0;
			break;
	}
}

Logo.prototype.draw = function() {

	var csize = this.width / 25;
	var lw = Math.floor(csize * this.text.length / 2 * this.zoom);
	var lh = Math.floor(csize * 1 * this.zoom);

	var x = this.x + this.halfw - lw;
	var y = this.y + this.halfh - lh;
	var fsize = Math.floor(this.width / 15 * this.zoom);

	this.div.css({
		left: x,
		top: y,
		fontSize: fsize
	})

}

////////////////////////
Logo.prototype.onStart = function() {
}

Logo.prototype.onStop = function() {
}

Logo.prototype.onFade = function(opa) {
}

Logo.prototype.onAudio = function(moment, period) {
	if (this.mode === 0)
		return;

	if (moment > this.threshold)
		this.zoom = 1 + this.sensitivity * (moment - this.threshold);
	else
		this.zoom = 1;

	this.draw();
}

Logo.prototype.onKeydown = function(key) {
	switch (key) {

	case 76:		// L
		this.toggle();
		break;
	}
}

Logo.prototype.onResize = function(x, y, width, height) {
	this.width = width;
	this.height = height;

	this.x = x;
	this.y = y;

	this.halfw = this.width / 2;
	this.halfh = this.height / 2;
	this.size = this.width / 20;

	this.draw();
}

Logo.prototype.onTimer = function() {
	if (this.mode !== 2)
		return;

	this.deg += 0.8;
	if (this.deg > 360) {
		this.deg -= 360;

		this.dirX = Math.random() < 0.5 ? 1 : -1;
		this.dirY = Math.random() < 0.5 ? 1 : -1;
		this.dirZ = Math.random() < 0.5 ? 1 : -1;

		this.moveX = Math.random() < 0.5 ? true : false;
		this.moveY = Math.random() < 0.5 ? true : false;
		if (!this.moveX && !this.moveY) {
			this.moveZ = true;
		} else {
			this.moveZ = Math.random() < 0.5 ? true : false;
		}
	}

	var dist = Math.floor(this.width / 10);
	var o = Math.cos(this.deg * 0.0174532925) * 0.3 + 0.4;

	var s = '';
	if (this.moveX) s += 'rotateX(' + (this.dirX * this.deg) + 'deg) ';
	if (this.moveY) s += 'rotateY(' + (this.dirY * this.deg) + 'deg) ';
	if (this.moveZ) s += 'rotateZ(' + (this.dirZ * this.deg) + 'deg) ';
	s += 'translateZ(' + dist + 'px)';

	this.div
	.css({
		transform: s,
		opacity: o
	})
}

Logo.prototype.onMidi = function(a1, a2, a3) {
}

////////////////////////

app.addCommonPlugin(new Logo('JSdrome'));

});




