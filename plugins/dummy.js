$(function() {
var Dummy = function(n) {
	this.description = 
		"Dummy\n"
		+ "  drawing test plugin\n"
		+ "  Audio insensitive\n";

	this.thumbnail = 'dummy.png';

	this.id = '#dummy' + n;
	var elem = $('<canvas>')
		.attr({id: 'dummy' + n})
		.css({
			position: 'absolute',
			margin:0,
			padding:0,
			backgroundColor:'transparent'
		})
		.appendTo('#jsdrome');
	this.canvas = elem[0];
//console.log(this.canvas);
	this.canvas.width = window.innerWidth;
	this.canvas.height = window.innerHeight;
	this.ctx = this.canvas.getContext('2d');

	this.arcx = Math.floor(this.canvas.width / 2);
	this.arcy = Math.floor(this.canvas.height / 2);

	this.moment = 0;
	this.period = 0;
}

Dummy.prototype.draw = function() {
	this.ctx.strokeStyle = 'rgb(40,40,200)';

	var x0 = 10;
	var y0 = 10;
	var x1 = this.canvas.width - 10;
	var y1 = this.canvas.height - 10;

	this.ctx.beginPath();
	this.ctx.moveTo(x0, y0);
	this.ctx.lineTo(x1, y0);
	this.ctx.lineTo(x1, y1);
	this.ctx.lineTo(x0, y1);
	this.ctx.closePath();
	this.ctx.stroke();

	this.ctx.fillStyle = 'rgb(160,160,255)';
	this.ctx.beginPath();
	this.ctx.arc(this.arcx, this.arcy, 5, 0, Math.PI * 2);
	this.ctx.fill();

	if (this.moment > 0) {
		this.ctx.fillStyle = 'rgb(60,60,255)';
		this.ctx.beginPath();
		var mx0 = x0 + 20;
		var mlen = y1 - y0 -4;
		var my0 = y1 - 2;
		this.ctx.beginPath();
		this.ctx.fillRect(mx0, my0, 20, -mlen * this.moment);
	}

	if (this.period > 0) {
		this.ctx.fillStyle = 'rgb(80,80,255)';
		this.ctx.beginPath();
		var px0 = x0 + 60;
		var plen = y1 - y0 -4;
		var py0 = y1 - 2;
		this.ctx.beginPath();
		this.ctx.fillRect(px0, py0, 20, -plen * this.period);
	}

}

////////////////////////
Dummy.prototype.onStart = function() {
//	console.log('A start');
	$(this.id).css({display: 'block'});
}

Dummy.prototype.onStop = function() {
//	console.log('A stop');
	$(this.id).css({display: 'none'});
}

Dummy.prototype.onFade = function(opa) {
//	console.log('A fade:' + opa);
	$(this.id).css({opacity: opa});
}

Dummy.prototype.onAudio = function(moment, period) {
	this.moment = moment;
	this.period = period;
}

Dummy.prototype.onKeydown = function(key) {
}

Dummy.prototype.onResize = function(x, y, width, height) {
	$(this.id).css({left: x, top: y});
    this.canvas.width = width;
    this.canvas.height = height;

	this.arcx = Math.floor(this.canvas.width / 2);
	this.arcy = Math.floor(this.canvas.height / 2);
}

Dummy.prototype.onTimer = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.draw();
}

Dummy.prototype.onMidi = function(a1, a2, a3) {
	if (a1 === 0xB0) {
		if (a2 === 0x09) {
			this.arcx = Math.floor(this.canvas.width * a3 / 127); 
		} else if (a2 === 0x0A) {
			this.arcy = Math.floor(this.canvas.height * a3 / 127);
		}
	}
}

////////////////////////

app.addPlugin(0, new Dummy(0));
app.addPlugin(1, new Dummy(1));

});
