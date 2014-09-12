
/////////////////////////////////////////////////////
var SampleBuffer = function(ctx, url, callback) {
	this.ctx = ctx;
	this.url = url;
	this.onload = callback;
	this.buffer = null;
};

SampleBuffer.prototype.loadBuffer = function(callback) {
	var request = new XMLHttpRequest();
	request.open("GET", this.url, true);
	request.responseType = "arraybuffer";

	var self = this;
	request.onload = function() {
		self.ctx.decodeAudioData(
			request.response,
			function(buffer) {
				if (!buffer) {
					console.log('error decode buffer: ' + self.url);
					return;
				}
				self.buffer = buffer;
				if (callback) {
					callback(self.buffer.getChannelData(0));
				}
			},
			function() {
				console.log('error decoding process: ' + self.url);
				return;
			}
		);
	}
	request.onerror = function() {
		alert('BufferLoader: XHR error');
	}

	request.send();
}

/////////////////////////////////////////////////////
var Rompler = function (ctx, url, callback) {
	this.ctx = ctx;
	this.sample = new SampleBuffer(this.ctx, url);
	this.sample.loadBuffer(callback);
	this.next = null;
	this.next2 = null;
	this.src = null;

//	this.pan = ctx.createPanner();
//	this.pan.setPosition(0, 0, -1.0);
//	this.gain = ctx.createGainNode();
//	this.gain.gain.value = 0.5;
//	this.pan.connect(this.gain);
//	this.gain.connect(ctx.destination);
};

/*
Rompler.prototype.set_gain = function(val) {
	if (val != null)
		this.gain.gain.value = val / 100;
	else
		this.gain.gain.value = 50 / 100;
};

Rompler.prototype.set_pan = function(val) {
	if (val != null)
		this.pan.setPosition((val - 50) / 50, 0, -1.0);
	else
		this.pan.setPosition(0, 0, -1.0);
};
*/

Rompler.prototype.connect = function(next) {
	this.next = next;
}
Rompler.prototype.connect2 = function(next) {
	this.next2 = next;
}

Rompler.prototype.disconnect = function(next) {
	if (this.src)
		this.src.disconnect();
	this.next = null;
}

Rompler.prototype.start = function(loop) {
	this.src = this.ctx.createBufferSource();
	if (this.sample.buffer != null) {
		this.src.buffer = this.sample.buffer;
		this.src.loop = loop;
		if (this.next)
			this.src.connect(this.next);
		if (this.next2)
			this.src.connect(this.next2);
		this.src.start(0);
	}
};

Rompler.prototype.stop = function() {
	if (this.src)
		this.src.stop(0);
};

