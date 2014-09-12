/*
 *
 * JSdrome - plugable javascript VJ platform
 *
 * This program is licensed under the MIT License.
 * Copyright 2014, aike (@aike1000)
 *
 */
var app;
var config = {
	mic: true,
	camera: true,
	midi: true,
	root: ''
}

$(function() {

// setup browser supported api
if ( !window.AudioContext ) {
	window.AudioContext =
		window.webkitAudioContext;
}
if ( !window.requestAnimationFrame ) {
	window.requestAnimationFrame =
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
}

//////////////////////////////////////////
// JSdrome definition
var JSdrome = function() {

	// CSS init
	$('body')
	.css({
		backgroundColor: '#000',
		margin: 0,
		padding: 0
	});

	$('#jsdrome')
	.css({
		margin: 0,
		padding: 0
	});

	// plugin array
	this.plugin = [[],[]];
	this.commonPlugin = [];
	this.selPluginA = 0;
	this.selPluginB = 0;
	this.fade = 1.0;
	this.activeA = true;
	this.activeB = false;

	// audio level buffer
	this.rbuf = new RingBuffer(10);
	for (var i = 0; i < this.rbuf.length; i++)
		this.rbuf.set(0.5);

	this.ctx = new AudioContext();

	// sensitivity
	this.preGain = this.ctx.createGain();
	this.preGain.gain.value = 0.4;
	// split target band
	this.lpf = this.ctx.createBiquadFilter();
	this.lpf.type = 0;
	this.lpf.frequency.value = 3000;
	this.lpf.Q.value = 2;
	// detector
	this.scrproc = this.ctx.createScriptProcessor(256);
	// let output volume zero
	this.postGain = this.ctx.createGain();
	this.postGain.gain.value = 0;
	// analyzer for visualize
	this.analyser = this.ctx.createAnalyser();
	this.analyser.fftSize = 1024;

	// mic -> lpf -> preGain -> scrproc -> postGain(0) -> destination
	//     -> analyzer
	this.preGain.connect(this.lpf);
	this.lpf.connect(this.scrproc);
	this.scrproc.connect(this.postGain);
	this.postGain.connect(this.ctx.destination);

	this.preGain.connect(this.analyser);

	this.sensitivity = 5;
	this.meancount = 0;
	this.release = 0;

	var self = this;
	if (config.midi) {
		// setup MIDI interface
		this.midi = new MidiInterface(
			function(){
				self.midi.setPort(1);
			},
			function(a1,a2,a3) {
				self.onMidi(a1,a2,a3);
			});
	}

	// setup WebRTC audio event listener
	if (config.mic) {
		navigator.webkitGetUserMedia(
			{audio : true},
			function(stream) { self.init(stream); },
			function(e) { console.log(e); }
		);
	} else {
		this.init();
	}
}

JSdrome.prototype.init = function(stream) {
	// input
	if (stream) {
		this.mic = this.ctx.createMediaStreamSource(stream);
	} else {
		this.mic = this.ctx.createGain();	// dummy
	}
	this.mic.connect(this.preGain);
	var self = this;
	this.scrproc.onaudioprocess = function(ev) {
		var inbuf0 = ev.inputBuffer.getChannelData(0);
		var inbuf1 = ev.inputBuffer.getChannelData(0);

		var buf0 = ev.outputBuffer.getChannelData(0);
		var buf1 = ev.outputBuffer.getChannelData(1);

		var sum = 0;
		for(var i = 0; i < 256; ++i) {
			if (i < 200) {
				sum += Math.abs(inbuf0[i]) + Math.abs(inbuf1[i]);
			} else if (i === 200) {
				sum = Math.min(sum / 50, 1.0);

				// sum: 
				//    直近4.5ミリ秒の絶対値合計
				//    リアルタイムの音量
				//    200sample / 44100Hz = 0.0045sec = 4.5msec

				self.meancount++;
				if (self.meancount > 50) {
					self.rbuf.set(sum);
					self.meancount = 0;
				}
				var mean = self.rbuf.mean(10) * 2;
				// mean:
				//    直近2250ミリ秒の絶対値合計平均（4.5 * 50ミリ秒毎に10個サンプル）
				//    パートレベルの音圧
				self.release = Math.max(sum, self.release - 0.005);
				var sum2 = self.release;
				if (mean > 1.0) mean = 1.0;
				if (self.activeA)
					self.plugin[0][self.selPluginA].onAudio(sum2, mean);
				if (self.activeB)
					self.plugin[1][self.selPluginB].onAudio(sum2, mean);
				for (var j = 0; j < self.commonPlugin.length; j++)
					self.commonPlugin[j].onAudio(sum2, mean);
			}
			buf0[i] = 0; //inbuf0[i];
			buf1[i] = 0; //inbuf1[i];
		}
	}
}

// show parameter value
JSdrome.prototype.showparam = function(s, val) {
	var vals = s + ' ';
	if (val !== undefined) {
		var i = 0;
		for (; i < val; i++)
			vals += '■';
		for (; i < 10; i++)
			vals += '□';
	}
	this.showtext(vals);
}

// show text
JSdrome.prototype.showtext = function(s) {
	$('#ptext').css({
		display: 'block'
	})
	.text(s);
	setTimeout(function() {
		$('#ptext').css({ display: 'none' });
	}, 100);
}

// interval timer event handler
JSdrome.prototype.onTimer = function() {
	if (this.plugin[0][this.selPluginA] && this.activeA)
		this.plugin[0][this.selPluginA].onTimer();
	if (this.plugin[1][this.selPluginB] && this.activeB)
		this.plugin[1][this.selPluginB].onTimer();
	for (var i = 0; i < this.commonPlugin.length; i++)
		this.commonPlugin[i].onTimer();
};

JSdrome.prototype.selectPlugin = function(n, bank) {
	if (n >= this.plugin[bank].length)
		return;

	if (bank === 0) {
		this.plugin[bank][this.selPluginA].onStop();
		this.selPluginA = n;
		if (this.activeA)
			this.plugin[bank][this.selPluginA].onStart();
		this.plugin[bank][this.selPluginA].onFade(this.fade);
	} else {
		this.plugin[bank][this.selPluginB].onStop();
		this.selPluginB = n;
		if (this.activeB)
			this.plugin[bank][this.selPluginB].onStart();
		this.plugin[bank][this.selPluginB].onFade(1.0 - this.fade);
	}
	this.onResize();
}


JSdrome.prototype.setFade = function(fade) {
	if ((this.plugin[0][this.selPluginA] === undefined)
	||  (this.plugin[1][this.selPluginB] === undefined))
		return;

	if (fade === 0.0) {
		if (this.activeA) {
			this.plugin[0][this.selPluginA].onStop();
			this.activeA = false;
		}
	} else if (fade === 1.0) {
		if (this.activeB) {
			this.plugin[1][this.selPluginB].onStop();
			this.activeB = false;
		}
	}
	if ((!this.activeA) && (fade > 0.0)) {
		this.plugin[0][this.selPluginA].onStart();
		this.activeA = true;
	}
	if ((!this.activeB) && (fade < 1.0)) {
		this.plugin[1][this.selPluginB].onStart();
		this.activeB = true;
	}
	this.plugin[0][this.selPluginA].onFade(fade);
	this.plugin[1][this.selPluginB].onFade(1.0 - fade);
	for (var i = 0; i < this.commonPlugin.length; i++)
		this.commonPlugin[i].onFade(fade);
}

/* 
	keydown event handler

	1234567890: select plugin for source A
	QWERTYUIOP: select plugin for source B

	A/Z: audio sensitivity
	S/X: cross fade source A/B
	D/C: reserved for plugins
	F/V: reserved for plugins

	?: show plugin info
*/
JSdrome.prototype.onKeydown = function(e) {

//	console.log('key:' + e.keyCode);

	switch (e.keyCode) {

	case 16: // shift
		this.shift = true;
		break;

	// プラグイン切り替え
	case 49: // 1
		this.selectPlugin(0, 0);
		break;
	case 50: // 2
		this.selectPlugin(1, 0);
		break;
	case 51: // 3
		this.selectPlugin(2, 0);
		break;
	case 52: // 4
		this.selectPlugin(3, 0);
		break;
	case 53: // 5
		this.selectPlugin(4, 0);
		break;
	case 54: // 6
		this.selectPlugin(5, 0);
		break;
	case 55: // 7
		this.selectPlugin(6, 0);
		break;
	case 56: // 8
		this.selectPlugin(7, 0);
		break;
	case 57: // 9
		this.selectPlugin(8, 0);
		break;
	case 48: // 0
		this.selectPlugin(9, 0);
		break;

	case 81: // Q
		this.selectPlugin(0, 1);
		break;
	case 87: // W
		this.selectPlugin(1, 1);
		break;
	case 69: // E
		this.selectPlugin(2, 1);
		break;
	case 82: // R
		this.selectPlugin(3, 1);
		break;
	case 84: // T
		this.selectPlugin(4, 1);
		break;
	case 89: // Y
		this.selectPlugin(5, 1);
		break;
	case 85: // U
		this.selectPlugin(6, 1);
		break;
	case 73: // I
		this.selectPlugin(7, 1);
		break;
	case 79: // O
		this.selectPlugin(8, 1);
		break;
	case 80: // P
		this.selectPlugin(9, 1);
		break;

	// cross fade
	case 65: // A
		this.fade += 0.1;
		if (this.fade >= 1.0)
			this.fade = 1.0;
		this.setFade(this.fade);
		break;
	case 90: // Z
		this.fade -= 0.1;
		if (this.fade <= 0.0)
			this.fade = 0.0;
		this.setFade(this.fade);
		break;

	// adjust sound sensitivity
	case 83: // S
		if (this.sensitivity < 20) this.sensitivity++;
		this.showparam('sense:', this.sensitivity);
		this.preGain.gain.value = this.sensitivity / 20;
		break;
	case 88: // X
		if (this.sensitivity > 0) this.sensitivity--;
		this.showparam('sensitivity:', this.sensitivity);
		this.preGain.gain.value = this.sensitivity / 20;
		break;

	// Show plugin information
	case 191: // ?
		if (this.shift) {
			console.log('===== COMMON =====')
			for (var i = 0; i < this.commonPlugin.length; i++)
				if (this.commonPlugin[i].description)
					console.log(this.commonPlugin[i].description);
			console.log('------------------')
			for (var i = 0; i < this.plugin[0].length; i++)
				if (this.plugin[0][i].description)
					console.log(this.plugin[0][i].description);
		}
		break;

	}


	if (this.fade >= 0.5)
		this.plugin[0][this.selPluginA].onKeydown(e.keyCode);
	else
		this.plugin[1][this.selPluginB].onKeydown(e.keyCode);
	for (var i = 0; i < this.commonPlugin.length; i++)
		this.commonPlugin[i].onKeydown(e.keyCode);
}

// keyup event handler
JSdrome.prototype.onKeyup = function(e) {
	switch (e.keyCode) {
	case 16: // shift
		this.shift = false;
		break;
	}
}

JSdrome.prototype.onMidi = function(a1, a2, a3) {
	switch (a1) {
		case 0x90:	// Note On
//			console.log('NoteOn: ' + a2 + ' ' + a3);
			switch (a2) {
				case 36:
					this.selectPlugin(0, 0);
					break;
				case 37:
					this.selectPlugin(1, 0);
					break;
				case 40:
					this.selectPlugin(2, 0);
					break;
				case 41:
					this.selectPlugin(3, 0);
					break;
				case 44:
					this.selectPlugin(4, 0);
					break;
				case 45:
					this.selectPlugin(5, 0);
					break;
				case 48:
					this.selectPlugin(6, 0);
					break;
				case 49:
					this.selectPlugin(7, 0);
					break;

				case 38:
					this.selectPlugin(0, 1);
					break;
				case 39:
					this.selectPlugin(1, 1);
					break;
				case 42:
					this.selectPlugin(2, 1);
					break;
				case 43:
					this.selectPlugin(3, 1);
					break;
				case 46:
					this.selectPlugin(4, 1);
					break;
				case 47:
					this.selectPlugin(5, 1);
					break;
				case 50:
					this.selectPlugin(6, 1);
					break;
				case 51:
					this.selectPlugin(7, 1);
					break;

			}
			break;
		case 0xB0:	// CC#
//			console.log('CC: ' + a1 + ' ' + a2 + ' ' + a3);
			switch (a2) {
				case 1:
					this.fade = 1.0 - a3 / 127;
					this.setFade(this.fade);
					break;
				case 2:
				case 3:
				case 4:
			}
			break;
	}

	if (this.fade >= 0.5)
		this.plugin[0][this.selPluginA].onMidi(a1, a2, a3);
	else
		this.plugin[1][this.selPluginB].onMidi(a1, a2, a3);
	for (var i = 0; i < this.commonPlugin.length; i++)
		this.commonPlugin[i].onMidi(a1, a2, a3);


}


// window resize event handler
JSdrome.prototype.onResize = function() {
	this.drawx = 0;
	this.drawy = 0;
	this.draww = $(window).width()
	this.drawh = $(window).height()

	for (var i = 0; i < this.commonPlugin.length; i++)
		this.commonPlugin[i].onResize(this.drawx, this.drawy, this.draww, this.drawh);
	if (this.plugin[0][this.selPluginA])
		this.plugin[0][this.selPluginA].onResize(this.drawx, this.drawy, this.draww, this.drawh);
	if (this.plugin[1][this.selPluginB])
		this.plugin[1][this.selPluginB].onResize(this.drawx, this.drawy, this.draww, this.drawh);
}


JSdrome.prototype.addPlugin = function(bank, obj) {
	this.plugin[bank].push(obj);
	obj.onStop();

	if ((bank === 0) && (this.plugin[0].length === 1)) {
		this.selectPlugin(0, 0);
	}
	if (bank === 1) {
		if (this.plugin[0].length === 1) {
			this.selectPlugin(0, 1);
		} else if (this.plugin[0].length === 2) {
			this.selectPlugin(1, 1);
		}
	}
}

JSdrome.prototype.addCommonPlugin = function(obj) {
	this.commonPlugin.push(obj);
	obj.onStart();
}

//////////////////////////////////////////


// generate JSdrome instance
app = new JSdrome();



// setup resize event listener
var resizetimer = false;
$(window).resize(function() {
	if (resizetimer !== false) {
		clearTimeout(resizetimer);
	}
	resizetimer = setTimeout(function() {
		app.onResize();
	}, 200);
});


// setup keyboard event listener
$(window).keydown(function(e){ app.onKeydown(e); });
$(window).keyup(function(e){ app.onKeyup(e); });

// setup timer event loop
(function timerloop() {
	app.onTimer();
	window.requestAnimationFrame(timerloop);
}());


});



