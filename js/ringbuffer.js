var RingBuffer = function(size) {
	this.cursor = -1;
	this.buffer = new Array(size);
	this.clear();
}

RingBuffer.prototype.clear = function() {
	for (var i = 0; i < this.buffer.length; i++)
		this.buffer[i] = 0;
}

RingBuffer.prototype.set = function(val) {
	this.cursor++;
	if (this.cursor >= this.buffer.length)
		this.cursor = 0;
	this.buffer[this.cursor] = val;
}

RingBuffer.prototype.get = function(offset) {
	var pos = this.cursor + offset;
	if (pos < 0)
		pos += this.buffer.length;
	else if (pos >= this.buffer.length)
		pos -= this.buffer.length;
	return this.buffer[pos];
}

RingBuffer.prototype.mean = function(num) {
	var sum = 0;
	for (var i = 0; i < num; i++)
		sum += this.get(-i);
	return sum / num;
}
