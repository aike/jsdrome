// leap motion plugin

// This program is licensed under the MIT License.
// Copyright 2014, aike (@aike1000)
//
// this plugin requires the following leap library
// <script src="http://js.leapmotion.com/leap-0.6.0-beta3.js"></script>

var LeapPlugin;

$(function() {

var LeapInterface = function() {
	this.description = 
		"Leap Interface\n"
		+ "  Input from Leap Motion common plugin\n";

	this.paused = false;

	this.ox = 0;
	this.oy = 0;
	this.oz = 0;

	this.x = 0;
	this.y = 0;
	this.z = 0;
}

////////////////////////
LeapInterface.prototype.onStart = function() {
}

LeapInterface.prototype.onStop = function() {
}

LeapInterface.prototype.onFade = function(opa) {
}

LeapInterface.prototype.onAudio = function(moment, period) {
}

LeapInterface.prototype.onKeydown = function(key) {
}

LeapInterface.prototype.onResize = function(x, y, width, height) {
}

LeapInterface.prototype.onTimer = function() {
}

LeapInterface.prototype.onMidi = function(a1, a2, a3) {
}

////////////////////////

LeapInterface.prototype.to128step = function(v, min, max) {
	if (v < min)
		v = min;
	else if (v > max)
		v = max;

	return Math.floor(127 * (v - min) / (max - min));
}

LeapInterface.prototype.toggle = function() {
	this.paused = !this.paused;
}

LeapInterface.prototype.loop = function() {
	if (this.paused)
		return;
	//
	//  to adjust for your motion area size
	//
	//      -200              200
	//  170  +-----------------+
	//       |
	//   30  +
	//
	var x = this.to128step(this.x, -200, 200);
	var y = 127 - this.to128step(this.y, 30, 170);

	if (x !== this.ox) {
		app.onMidi(0xB0, 0x09, x);	// x motion to MIDI CC#09
		this.ox = x;
	}
	if (y !== this.oy) {
		app.onMidi(0xB0, 0x0A, y);	// y motion to MIDI CC#0A
		this.oy = y;
	}
}

LeapPlugin = new LeapInterface()
app.addCommonPlugin(LeapPlugin);
setInterval(function(){ LeapPlugin.loop(); }, 50);

});


Leap.loop({enableGestures: false}, function(frame) {
	if (LeapPlugin.paused) {
		return;
	}

	if (frame.pointables.length > 0) {
		for (var i = 0; i < frame.pointables.length; i++) {
			var p = frame.pointables[i];
			if (p.type !== 1) continue;		// use index finger position only
			LeapPlugin.x = p.tipPosition[0];
			LeapPlugin.y = p.tipPosition[1];
			LeapPlugin.z = p.tipPosition[2];
		}
	}
})

