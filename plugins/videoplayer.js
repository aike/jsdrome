// Video Player plugin

// This program is licensed under the MIT License.
// Copyright 2014, aike (@aike1000)

$(function() {
var VideoPlayer = function(n, src, loop) {
	this.id = '#videoplayer' + n;
	this.description = 
		"Video Player\n"
		+ "  video player plugin\n"
		+ "  Audio insensitive\n";

	this.thumbnail = 'videoplayer.png';

	var preload = 'auto';
	if (location.hostname === 'localhost')
		preload = 'none';	// auto preload has a problem that secondary video loading too late

	var loopfunc = '';
	if (loop)
		loopfunc = 'this.play();'
	var elem = $('<video>')
		.attr({
			id: 'videoplayer' + n,
			//onloadstart: "console.log('************ load start " + n + "');",
			//onloadeddata: "console.log('************ loaded data " + n + "');",
			onended: loopfunc,
			preload: preload
		})
		.css({
			position: 'absolute',
			margin:0,
			padding:0,
			backgroundColor:'transparent',
			zIndex: 500 + n
		})
		.appendTo('#jsdrome');
	this.src = $('<source>')
	.attr({src:src, type:"video/mp4"})
	.appendTo(elem);

	this.video = elem[0];
	this.video.volume = 0;
}


////////////////////////
VideoPlayer.prototype.onStart = function() {
	$(this.id).css({display: 'block'});
	this.video.play();
	var self = this;
}

VideoPlayer.prototype.onStop = function() {
	this.video.pause();
	$(this.id).css({display: 'none'});
}

VideoPlayer.prototype.onFade = function(opa) {
	$(this.id).css({opacity: opa});
}

VideoPlayer.prototype.onAudio = function(moment, period) {
}

VideoPlayer.prototype.onKeydown = function(key) {
}

VideoPlayer.prototype.onResize = function(x, y, width, height) {
	$(this.id).css({
		left: x,
		top: y,
		width: width,
		height: height
	});	
}

VideoPlayer.prototype.onTimer = function() {
}

VideoPlayer.prototype.onMidi = function() {
}

////////////////////////

app.addPlugin(0, new VideoPlayer(0, 'movies/fire.mp4'));
app.addPlugin(1, new VideoPlayer(1, 'movies/fire.mp4', true));

});
