// Control Window plugin

// This program is licensed under the MIT License.
// Copyright 2014, aike (@aike1000)

$(function() {

var MiniWindow = function(app) {
	this.description = 
		"MiniWindow\n"
		+ "  Make drawing area smaller common plugin\n"
		+ "  Audio insensitive\n"
		+ "  [return] full screen on/off\n";

	this.id = 'miniwindow';

	this.app = app;
	this.enable = true;

	this.key = [['1','2','3','4','5','6','7','8','9','0'],
				['Q','W','E','R','T','Y','U','I','O','P']];

	this.descA = this.drawDescArea(this.id + '_textA');
	this.descB = this.drawDescArea(this.id + '_textB');
	this.descA.css({opacity: 1});
	this.descB.css({opacity: 0});
	this.descCommon = $('<div>')
		.attr({ id: this.id + '_com' })
		.css({
			position: 'absolute',
			top: 500,
			left: 100,
			color: '#fff',
			fontSize: 11
		})
		.appendTo('#jsdrome');

	this.cursor = new Array(2);
	this.thumbWidth = 70 + 10 * 80 + 9 * 10 + 20;
	this.thumb = this.drawThumbArea(this.id + '_thmb');

	var self = this;
	setTimeout(function() { self.drawThumb(); }, 1000);
	setTimeout(function() { self.drawCommonDesc(); }, 2000);
}

MiniWindow.prototype.drawThumbArea = function(id) {
	var elem = $('<div>')
	.attr({ id: id })
	.css({
		position: 'absolute',
		top: 10,
		left: 100,
		width: this.thumbWidth,
		height: 150,
		backgroundColor: '#111130'
	}).appendTo('#jsdrome');

	this.cursor[0] = $('<div>')
	.css({
		position: 'absolute',
		left: 70 + 0 * 90 - 1,
		top: 25 + 0 * 55 - 1,
		width: 80,
		height: 45,
		border: 'solid 1px #ddddee',
		boxShadow: '0 0 5px 5px rgba(127,127,255,0.5)',
		zIndex: 5
	}).appendTo(elem);

	this.cursor[1] = $('<div>')
	.css({
		position: 'absolute',
		left: 70 + 0 * 90 - 1,
		top: 25 + 1 * 55 - 1,
		width: 80,
		height: 45,
		border: 'solid 1px #ddddee',
		boxShadow: '0 0 5px 5px rgba(127,127,255,0.5)',
		zIndex: 5
	}).appendTo(elem);

	var self = this;
	this.xfader = $('<input>')
	.attr({
		type: 'range',
		min: 0,
		max: 100,
		step: 1,
		value: 100
	})
	.css({
		position: 'absolute',
		top: 60,
		left: -20,
		width: 90,
		height: 20,
		transform: 'rotate(-90deg)'
	})
	.on('input', function(){
		self.app.fade = this.value / 100;
		self.app.setFade(self.app.fade);
	})
	.appendTo(elem);


	return elem;
}

MiniWindow.prototype.setCursor = function(ch, pos, opa) {
	var alpha;
	if (ch === 0) {
		alpha = opa.toFixed(1);
	} else {
		alpha = (1.0 - opa).toFixed(1);
	}

	this.cursor[ch]
	.css({
		left: 70 + pos * 90 - 1,
		boxShadow: '0 0 5px 5px rgba(127,127,255,' + alpha + ')'
	})
}

MiniWindow.prototype.drawThumb = function() {
	var divid = '#' + this.id + '_thmb';

	var self = this;
	for (var i = 0; i < 2; i++) {
		var jmax = Math.min(10, this.app.plugin[i].length);
		for (var j = 0; j < jmax; j++) {
			var imagefile = 'noimage.png';
			if (this.app.plugin[i][j].thumbnail) {
				imagefile = this.app.plugin[i][j].thumbnail;
			}
				$('<img>')
				.attr({
					src: config.root + 'images/' + imagefile,
					ch: i,
					pos: j
				})
				.css({
					position: 'absolute',
					left: 70 + j * 90,
					top: 25 + i * 55,
					width: 80,
					height: 45,
					backgroundColor: '#222288',
					cursor: 'pointer',
					zIndex: 10
				})
				.click(function() {
					var ch = parseInt($(this).attr('ch'), 10);
					var pos = parseInt($(this).attr('pos'), 10);
					self.setCursor(ch, pos, self.app.fade);
					self.app.selectPlugin(pos, ch);
					self.showDescription();
				})
				.appendTo(divid);
		}
	}

	for (var i = 0; i < 2; i++) {
		for (var j = 0; j < this.key[i].length; j++) {
			$('<div>')
			.css({
				position: 'absolute',
				top: 8 + i * 124,
				left: 110 + j * 90,
				color: '#bbbbbb',
				fontSize: 9
			})
			.text(this.key[i][j])
			.appendTo(divid);
		}
	}


	this.setCursor(0, this.app.selPluginA, this.app.fade);
	this.setCursor(1, this.app.selPluginB, this.app.fade);
}


MiniWindow.prototype.drawDescArea = function(id) {
	var div = $('<div>')
	.attr({ id: id })
	.css({
		position: 'absolute',
		top: 150,
		left: 100,
		width: 400
	}).appendTo('#jsdrome');

	$('<div>')
	.attr({ id: id + '1'})
	.css({
		position: 'absolute',
		top: 0,
		left: 0,
		color: '#fff',
		fontSize: 16
	}).appendTo(div);

	$('<div>')
	.attr({ id: id + '2'})
	.css({
		position: 'absolute',
		top: 50,
		left: 0,
		color: '#fff',
		fontSize: 16
	}).appendTo(div);

	return div;
}

MiniWindow.prototype.drawCommonDesc = function() {
	var desc = '[A][Z] cross fade<br>'
			 + '[S][X] audio sensitivity<br>';
	var p = this.app.commonPlugin;
	for (var i = 0; i < p.length; i++) {
		if (p[i].description) {
			var s = p[i].description.match(/^ *\[.*$/m);
			if (s) {
				desc += s + '<br>';
			}
		}
	}
	$('#' + this.id + '_com').html(desc);
}

////////////////////////
MiniWindow.prototype.onStart = function() {
}

MiniWindow.prototype.onStop = function() {
}

MiniWindow.prototype.onFade = function(opa) {
	this.descA.css({opacity: opa});
	this.descB.css({opacity: 1.0 - opa});

	this.setCursor(0, this.app.selPluginA, this.app.fade);
	this.setCursor(1, this.app.selPluginB, this.app.fade);
}

MiniWindow.prototype.onAudio = function(moment, period) {
}

MiniWindow.prototype.showDescriptionSub = function(isA) {
	var n, m, s, elem;
	if (isA) {
		n = 0;
		m = this.app.selPluginA;
		s = this.key[0][m];
		elem = this.descA;
	} else {
		n = 1;
		m = this.app.selPluginB;
		s = this.key[1][m];
		elem = this.descB;
	}
	if (!this.app.plugin[n][m])
		return;
	var text = this.app.plugin[n][m].description;
	var re = text.match(/(.*)/g);
	var title = re[0];
	var body = text.substring(title.length + 1);
	elem.children(':first')
	.text('[' + s + '] ' + title)
	.next()
	.html(body.replace(/\n/g, '<br>'));
}

MiniWindow.prototype.showDescription = function() {
	this.showDescriptionSub(true);
	this.showDescriptionSub(false);
}

MiniWindow.prototype.onKeydown = function(key) {
	switch (key) {

	case 65: // A
	case 90: // Z
		this.xfader.val(Math.floor(this.app.fade * 100));
		break;

	case 13:		// return
		this.enable = !this.enable;
		if (this.enable) {
			this.descCommon
			.css({ display: 'block' });
			this.descA
			.css({ display: 'block' });
			this.descB
			.css({ display: 'block' });
			this.thumb
			.css({ display: 'block' });
			app.onResize();
		} else {
			this.descCommon
			.css({ display: 'none' });
			this.descA
			.css({ display: 'none' });
			this.descB
			.css({ display: 'none' });
			this.thumb
			.css({ display: 'none' });
			app.onResize();
		}
		break;

	// プラグイン切り替え
	case 49: // 1
	case 50: // 2
	case 51: // 3
	case 52: // 4
	case 53: // 5
	case 54: // 6
	case 55: // 7
	case 56: // 8
	case 57: // 9
	case 48: // 0
		this.showDescription();
		this.setCursor(0, this.app.selPluginA, this.app.fade);
		break;

	case 81: // Q
	case 87: // W
	case 69: // E
	case 82: // R
	case 84: // T
	case 89: // Y
	case 85: // U
	case 73: // I
	case 79: // O
	case 80: // P
		this.showDescription();
		this.setCursor(1, this.app.selPluginB, this.app.fade);
		break;
	}
}

MiniWindow.prototype.onResize = function(x, y, width, height) {
	if (this.enable) {
		app.draww = Math.floor(width / 2 - 100);
		app.drawh = Math.floor(app.draww * 9 / 16);
		app.drawx = Math.floor(width / 2 + 50);
		app.drawy = 200;
	}

	var y = app.drawy;
	this.descA.css({top: y});
	this.descB.css({top: y});

	this.thumb.css({ left: (width - this.thumbWidth) / 2})
}

MiniWindow.prototype.onTimer = function() {
}

MiniWindow.prototype.onMidi = function(a1, a2, a3) {
	switch (a1) {
		case 0x90:	// Note On
			switch (a2) {
				case 36:
				case 37:
				case 40:
				case 41:
				case 44:
				case 45:
				case 48:
				case 49:
					this.showDescription();
					this.setCursor(0, this.app.selPluginA, this.app.fade);
					break;

				case 38:
				case 39:
				case 42:
				case 43:
				case 46:
				case 47:
				case 50:
				case 51:
					this.showDescription();
					this.setCursor(1, this.app.selPluginB, this.app.fade);
					break;
			}

		case 0xB0:	// CC#
			switch (a2) {
				case 1:
					this.xfader.val(Math.floor(this.app.fade * 100));
					break;
			}
			break;
	}
}

////////////////////////

app.addCommonPlugin(new MiniWindow(app));

});




