// Camera plugin

// This program is licensed under the MIT License.
// Copyright 2014, aike (@aike1000)

$(function() {
var Camera = function(n) {
	this.srcwidth = 640;
	this.srcheight = 360;

	this.delayframe = 5;

	this.description = 
		"Camera\n"
		+ "  camera input plugin\n"
		+ "  [K] camera on/off\n";

	var id_base = 'camera' + n;
	this.id = '#' + id_base;

	this.container = $('<div>')
		.attr({
			id: id_base
		})
		.css({
			position: 'absolute',
			top: 0,
			left: 0,
			zIndex: 100
		})
		.appendTo('#jsdrome');

	var elem = $('<canvas>')
		.attr({id: id_base + 'c'})
		.css({
			position: 'absolute',
			margin:0,
			padding:0,
			backgroundColor:'transparent',
			display: 'none'
		})
		.appendTo(this.container);
	this.canvas = elem[0];
//	this.canvas.width = window.innerWidth;
//	this.canvas.height = window.innerHeight;
	this.canvas.width = this.srcwidth;
	this.canvas.height = this.srcheight;
	this.ctx = this.canvas.getContext('2d');

	elem = $('<canvas>')
		.attr({id: id_base + 'c2'})
		.css({
			position: 'absolute',
			margin:0,
			padding:0,
			backgroundColor:'transparent',
			display: 'none'
		})
		.appendTo(this.container);
	this.canvas2 = elem[0];
//	this.canvas2.width = window.innerWidth;
//	this.canvas2.height = window.innerHeight;
	this.canvas2.width = this.srcwidth;
	this.canvas2.height = this.srcheight;
	this.ctx2 = this.canvas2.getContext('2d');

	elem = $('<canvas>')
		.attr({id: id_base + 'c3'})
		.css({
			position: 'absolute',
			margin:0,
			padding:0,
			backgroundColor:'transparent'
		})
		.appendTo(this.container);
	this.canvas3 = elem[0];
//	this.canvas2.width = window.innerWidth;
//	this.canvas2.height = window.innerHeight;
	this.canvas3.width = this.srcwidth;
	this.canvas3.height = this.srcheight;
	this.ctx3 = this.canvas3.getContext('2d');

//	this.imagebuf = this.ctx.createImageData(this.canvas.width, this.canvas.height); 

	elem = $('<video autoplay>')
	.attr({
		id: id_base + 'v',
		width: this.srcwidth,
		height: this.srcheight
	})
	.css({
		display: 'none'
	})
	.appendTo(this.container);
	this.video = elem[0];

	this.cnt = 9999;
	this.skip = 9999;
	this.enable = false;

	var self = this;
    MediaStreamTrack.getSources(function (src) {
	    var ids = new Array(); 
		for (var i=0; i < src.length; i++) {
		    if (src[i].kind === "video") {
				ids.push(src[i].id);
		    }
		}
		console.log(ids);
		console.log(ids[ids.length - 1]);
		navigator.webkitGetUserMedia({ video:
				{optional: [{sourceId: ids[ids.length - 1]}]}
			, audio:false },
			function(stream) {
				self.init(stream);
			},
			function(e) {
				console.log(e);
			});
    })


}

Camera.prototype.init = function(stream) {
	this.stream = stream;
	//this.video.src = window.URL.createObjectURL(this.stream);
	this.video.src = webkitURL.createObjectURL(this.stream);
}


Camera.prototype.draw = function() {
	var w = this.srcwidth;//this.canvas.width;
	var h = this.srcheight;//this.canvas.height;

	this.ctx.drawImage(this.video, 0, 0);
	var org = this.ctx.getImageData(0, 0, w, h);
	var mod = this.ctx.createImageData(org);
	var imageorg = org.data;
	var imagemod = mod.data;

	this.cnt++;
	if (this.cnt > this.delayframe) {
		this.dly = this.ctx.getImageData(0, 0, w, h);
		this.cnt = 0;
	}
	this.imagdly = this.dly.data;

	for (var y = 0; y < h; y++) {
		var offsetY = y * w;
		for (var x = 0; x < w; x++) {
			var offsetXY = (offsetY + x) * 4;
			var r = Math.abs(imageorg[offsetXY + 0] * 0.5 - this.imagdly[offsetXY + 0] * 0.5);
			var g = Math.abs(imageorg[offsetXY + 1] * 0.5 - this.imagdly[offsetXY + 1] * 0.5);
			var b = Math.abs(imageorg[offsetXY + 2] * 0.5 - this.imagdly[offsetXY + 2] * 0.5);
			var gray = Math.floor((r + g + b) / 3);
			var a;
			if (gray > 40) {
				r = 150;
				g = 0;
				b = 0;
				a = 80;
			} else if (gray > 15) {
				r = 255;
				g = 255;
				b = gray;
				a = 80;
			} else {
				r = 0;
				g = 0;
				b = 0;
				a = 0;
			}
			imagemod[offsetXY + 0] = r;
			imagemod[offsetXY + 1] = g;
			imagemod[offsetXY + 2] = b;
			imagemod[offsetXY + 3] = a;
		}
	}

	this.ctx2.putImageData(mod, 0, 0);
	this.ctx3.drawImage(this.canvas2, 0, 0, this.canvas3.width, this.canvas3.height);
}

Camera.prototype.toggle = function() {
	this.enable = ! this.enable;
	if (this.enable) {
		this.onStart();
	} else {
		this.onStop();
	}
}

////////////////////////
Camera.prototype.onStart = function() {
	$(this.id).css({display: 'block'});
}

Camera.prototype.onStop = function() {
	$(this.id).css({display: 'none'});
	this.ctx3.clearRect(0, 0, this.canvas3.width, this.canvas3.height);
}

Camera.prototype.onFade = function(opa) {
}

Camera.prototype.onAudio = function(moment, period) {
}

Camera.prototype.onKeydown = function(key) {
	switch (key) {
		case 75:	// K
			this.toggle();
			break;
	}
}

Camera.prototype.onResize = function(x, y, width, height) {
	$(this.id).css({left: x, top: y});
	this.container.width = this.canvas3.width = width;
	this.container.height = this.canvas3.height = height;
}

Camera.prototype.onTimer = function() {
	if (this.enable) {
		this.skip++;
		if (this.skip > 3) {
			this.ctx3.clearRect(0, 0, this.canvas3.width, this.canvas3.height);
			this.draw();
			this.skip = 0;
		}
	}
}

Camera.prototype.onMidi = function(a1, a2, a3) {
}

////////////////////////

app.addCommonPlugin(new Camera(0));
//app.addPlugin(1, new Camera(1));

});
