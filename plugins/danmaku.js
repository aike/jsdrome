// Danmaku plugin

// This program is licensed under the MIT License.
// Copyright 2014, aike (@aike1000)

$(function() {

var DanmakuBullet = function(ctx) {
	this.ctx = ctx;
	this.x = 500;
	this.y = 200;
	this.r = 3;
	this.vx = 1;
	this.vy = 1;
	this.vr = 0.3;
	this.life = 0;
	this.lifemax = 500;
	this.show = false;
	this.type = 0;
	this.alpha = 0;
}

DanmakuBullet.prototype.move = function() {
	var acc = 1.0 + 0.00001 * this.life;
	this.vx = this.vx * acc;
	this.vy = this.vy * acc;

	this.x += this.vx;
	this.y += this.vy;
	this.r += this.vr;
	//this.r += 0.05;
	this.life++;
	if (this.life > this.lifemax) {
		this.show = false;
	}
	if (this.life < this.lifemax * 0.8) {
		if (this.alpha < 1.0)
			this.alpha += 0.005;
	} else {
		if (this.alpha > 0.001)
			this.alpha -= 0.02;
	}
	this.alpha = Math.floor(this.alpha * 1000) / 1000;
}

DanmakuBullet.prototype.draw = function() {
	var x = this.x;
	var y = this.y;
	var r = this.r;

	var l = this.life / this.lifemax;
	var cr, cg, cb;
	var b = 255 * this.brightness;
	if (isNaN(b)) b = 0;
	cr = Math.floor(b - (b * 3 / 4) * l);
	cg = cr;
	cb = Math.floor(b);

	var rgba = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + this.alpha + ')';
	var grad = this.ctx.createRadialGradient(x, y, 0, x, y, r);
	grad.addColorStop(0, rgba);
	grad.addColorStop(1, 'rgba(0,0,0,0)');
	this.ctx.fillStyle = grad;
	this.ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

var DanmakuGun = function(ctx, dir) {
	this.ctx = ctx;
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	this.bullets = [];
	this.angle = 0;
	this.dir = dir;
	this.cnt = 0;
	this.cnt2 = 0;
	this.dir = dir;
	this.moment = 0;

	this.vx = 0;
	this.vy = 0;
	this.walker_cmd = 0;
	this.walker_cnt = 0;
	this.root = [
		['move', 0.5, 0.5],
		['stay', 1000],
		['move', 0.5 + dir * 0.2, 0.5],
		['stay', 1000],
		['move', 0.5, 0.5 + dir * 0.2],
		['stay', 500],
		['move', 0.5 - dir * 0.2, 0.5],
		['stay', 1000]
	];
}

DanmakuGun.prototype.move = function() {
	var cmd = this.root[this.walker_cmd][0];
	var dx, dy;
	var cnt;
	var res = 1;
	switch (cmd) {
		case 'move':
			dx = this.root[this.walker_cmd][1] * this.width;
			dy = this.root[this.walker_cmd][2] * this.height;
			if ((Math.abs(dx - this.x) < res)
			&&  (Math.abs(dy - this.y) < res)) {
				this.walker_cmd = (this.walker_cmd + 1 ) % this.root.length;
				return;
			}
			if (dx - this.x > res)
				this.vx = res;
			else if (this.x - dx > res)
				this.vx = -res;
			if (dy - this.y > res)
				this.vy = res;
			else if (this.y - dy > res)
				this.vy = -res;

			this.x += this.vx;
			this.y += this.vy;

			this.walker_cnt = 0;
			break;
		case 'stay':
			this.vx = 0;
			this.vy = 0;
			cnt = this.root[this.walker_cmd][1];
			this.walker_cnt++;
			if (this.walker_cnt >= cnt) {
				this.walker_cmd = (this.walker_cmd + 1 ) % this.root.length;
				return;				
			}
			break;
	}
}

DanmakuGun.prototype.getBullet = function() {
	var bullet = null;
	if (this.bullets.length < 400) {
		bullet = new DanmakuBullet(this.ctx);
		this.bullets.push(bullet);
	} else {
		for (var i = 0; i < this.bullets.length; i++) {
			if (!this.bullets[i].show) {
				bullet = this.bullets[i];
			}
		}
	}
	return bullet;
}

DanmakuGun.prototype.fire = function() {
	this.cnt++;
	if (this.cnt % 20 !== 0)
		return;
	this.cnt = 0;

	this.angle += 20 * this.dir;
	if (this.angle > 360)
		this.angle -= 360;

	var b = 0.6 + (0.4 * this.moment);
	if (isNaN(b))
		b = 0;
	for (var i = 0; i < 4; i++) {
		var bullet = this.getBullet();
		if (!bullet)
			return;

		var rad = this.deg2rad(this.angle + 90 * i);
		bullet.x = this.x;
		bullet.y = this.y;
		bullet.vx = Math.sin(rad) * 0.8;
		bullet.vy = Math.cos(rad) * 0.8;
		bullet.vr = 0.3;
		bullet.r = 3;
		bullet.alpha = b;
		bullet.life = 0;
		bullet.lifemax = this.width / 3;
		bullet.show = true;
		bullet.type = 0;
		bullet.brightness = b;
	}
}

DanmakuGun.prototype.fire2 = function() {

	this.cnt2++;
	if (this.cnt2 % 100 !== 0)
		return;
	this.cnt2 = 0;

	for (var i = 0; i < 4; i++) {
		var bullet = this.getBullet();
		if (!bullet)
			return;
		var angle = this.dir === 1.0 ? 0 : 45;
		var rad = this.deg2rad(angle + 90 * i);
		bullet.x = this.x;
		bullet.y = this.y;
		bullet.vx = Math.sin(rad) * 4.0;
		bullet.vy = Math.cos(rad) * 4.0;
		bullet.vr = 0.01;
		bullet.r = 30;
		bullet.alpha = 0.5;
		bullet.life = 0;
		bullet.lifemax = this.width / 4;
		bullet.show = true;
		bullet.type = 1;
		bullet.brightness = 1;
	}
}


DanmakuGun.prototype.draw = function() {
	for (var i = 0; i < this.bullets.length; i++) {
		if (this.bullets[i].show) {
			this.bullets[i].move();
			this.bullets[i].draw();
		}
	}
}

DanmakuGun.prototype.deg2rad = function(deg) {
  return deg * 0.017453292519943295; // (deg / 180) * Math.PI;
}

/////////////////////////////////////////////////////////
var Danmaku = function(n) {
	this.description = 
		"Danmaku\n"
		+ "  danmaku like particle graphics drawing plugin\n"
		+ "  Audio insensitive\n";

	this.thumbnail = 'danmaku.png';

	this.id = '#danmaku' + n
	var elem = $('<canvas>')
		.attr({id: 'danmaku' + n})
		.css({
			position: 'absolute',
			margin:0,
			padding:0,
			backgroundColor:'transparent'
		})
		.appendTo('#jsdrome');
	this.canvas = elem[0];
	this.canvas.width = window.innerWidth;
	this.canvas.height = window.innerHeight;
	this.ctx = this.canvas.getContext('2d');
	this.ctx.globalCompositeOperation = "lighter";

	this.gun1 = new DanmakuGun(this.ctx, 1);
	this.gun2 = new DanmakuGun(this.ctx, -1);
}


Danmaku.prototype.fire = function() {
	this.gun1.fire();
	this.gun2.fire();
}

Danmaku.prototype.fire2 = function() {
	this.gun1.fire2();
	this.gun2.fire2();
}

Danmaku.prototype.draw = function() {
	this.gun1.draw();
	this.gun2.draw();

	this.gun1.move();
	this.gun2.move();
}

////////////////////////
Danmaku.prototype.onStart = function() {
	$(this.id).css({display: 'block'});
}

Danmaku.prototype.onStop = function() {
	$(this.id).css({display: 'none'});
}

Danmaku.prototype.onFade = function(opa) {
	$(this.id).css({opacity: opa});
	this.ctx.globalAlpha = opa;
}

Danmaku.prototype.onAudio = function(moment, period) {
	this.gun1.moment = moment;
	this.gun2.moment = moment;
	if (moment > 0.2)
		this.fire2();
}

Danmaku.prototype.onKeydown = function(key) {
}

Danmaku.prototype.onResize = function(x, y, width, height) {
	$(this.id).css({left: x, top: y});

    this.canvas.width = width;
    this.canvas.height = height;

    this.gun1.width = width;
    this.gun1.height = height;
    this.gun2.width = width;
    this.gun2.height = height;    

    this.gun1.x = width / 2;
    this.gun1.y = height / 2;

    this.gun2.x = width / 2;
    this.gun2.y = height / 2;
}

Danmaku.prototype.onTimer = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.fire();
	this.draw();
}

Danmaku.prototype.onMidi = function(a1, a2, a3) {
}

////////////////////////

app.addPlugin(0, new Danmaku(0));
app.addPlugin(1, new Danmaku(1));

});
