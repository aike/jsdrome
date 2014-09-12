$(function() {

var MusicPlayer = function(app, urls) {
	this.description = 
		"MusicPlayer\n"
		+ "  MP3 Player common plugin\n"
		+ "  Audio insensitive\n"
		+ "  [M] music play/stop  [<-][->] change music\n";

	this.app = app;
	this.ctx = app.ctx;
	this.sensorNode = this.app.preGain;
	this.ready = false;
	this.enable = false;

	this.urls = urls;
	this.index = 0;

	var self = this;
	this.rompler = new Rompler(this.ctx, 'music/' + this.urls[this.index],
		function() {
			self.ready = true;
			console.log('music player: ready');
		});
}

MusicPlayer.prototype.toggle = function() {
	if (!this.ready)
		return;

	this.enable = !this.enable;

	if (this.enable) {
		this.rompler.connect(this.sensorNode);
		this.rompler.connect2(this.ctx.destination);

		if (this.app.mic)
			this.app.mic.disconnect();


		if (this.ready)
			this.rompler.start(true);
	} else {
		this.rompler.disconnect();
		if (this.app.mic)
			this.app.mic.connect(this.sensorNode);
		this.rompler.stop();
	}
}

////////////////////////
MusicPlayer.prototype.onStart = function() {
}

MusicPlayer.prototype.onStop = function() {
}

MusicPlayer.prototype.onFade = function(opa) {
}

MusicPlayer.prototype.onAudio = function(moment, period) {
}

MusicPlayer.prototype.loadSoundFile = function(key) {
	this.rompler.sample.url = 'music/' + this.urls[this.index];
	this.rompler.sample.loadBuffer(function() {
		self.ready = true;
		console.log('music player: ready');
		self.toggle();
		self.toggle();		
	});

}

MusicPlayer.prototype.onKeydown = function(key) {
	switch (key) {

	case 77:		// M
		this.toggle();
		break;

	case 37:
		this.index -= 1;
		if (this.index < 0)
			this.index = this.urls.length - 1;
		this.loadSoundFile();
		break;
	case 39:
		this.index += 1;
		if (this.index >= this.urls.length)
			this.index = 0;
		this.loadSoundFile();
		break;
	}
}

MusicPlayer.prototype.onResize = function(x, y, width, height) {
}

MusicPlayer.prototype.onTimer = function() {
}

MusicPlayer.prototype.onMidi = function(a1, a2, a3) {
}

var urls = [
		'magic.mp3'
	];

app.addCommonPlugin(new MusicPlayer(app, urls));

});




