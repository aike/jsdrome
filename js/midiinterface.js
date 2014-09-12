var MidiInterface = function(initCallback, onMidiCallback) {
	this.in_port = null;
	this.inputs = null;
	this.outputs = null;
	this.input = null;
	this.inportList = [];
	this.ch = 0;
	this.midi = null;
	this.initCallback = initCallback;
	this.onMidiCallback = onMidiCallback;

	var self = this;
	this.onMidiSuccess = function(midiAccess) {
		console.log('MIDI: ready!');
		self.midi = midiAccess;
		self.getInterfaceList();
		self.setPort(0);
		if (self.initCallback)
			self.initCallback(self.inportList);
	};
	this.onMidiFailure = function(msg) {
		//alert('Failed - ' + msg);
	};

	navigator.requestMIDIAccess().then(this.onMidiSuccess, this.onMidiFailure);
}

////////////////// Top Level API ////////////////////////

//MidiInterface.prototype.initialize = function() {
//	navigator.requestMIDIAccess().then(this.onMidiSuccess, this.onMidiFailure);
//}

MidiInterface.prototype.getInterfaceList = function() {
	var inputs = this.midi.inputs();
	for (var i = 0; i < inputs.length; i++) {
		this.inportList.push({value: i.toString(10), text:inputs[i].name});
	}
}

MidiInterface.prototype.setPort = function(n) {
	if (this.in_port !== null)
		this.midi.inputs()[this.in_port].onmidimessage = function() {};
	this.in_port = n;

	var self = this;
	this.onmidimessage = function(e) { self.receive(e); };
	this.midi.inputs()[this.in_port].onmidimessage = this.onmidimessage;
}

MidiInterface.prototype.setMidiChannel = function(n) {
	this.ch = n;
}

MidiInterface.prototype.receive = function(event) {
//console.log(event.data);
	$('#sig').text('■');
	setTimeout(function() {	$('#sig').text('□'); }, 50);

	if ((event.data.length >= 3)
	&& ((event.data[0] & 0xF0) === 0x90) && (event.data[2] > 0)) {
		// Note On
		if (this.onMidiCallback)
			this.onMidiCallback(0x90, event.data[1], event.data[2]);
	} else if ((event.data.length >= 3)
	&& ((event.data[0] & 0xF0) === 0xB0)) {
		// CC#
		var note_no = event.data[1];
		if (this.onMidiCallback)
			this.onMidiCallback(0xB0, event.data[1], event.data[2]);
	}

}

