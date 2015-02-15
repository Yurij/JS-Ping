/**
 * ------------------------------------------------------------------------
 * JS Ping Emulator v.1.0
 * ------------------------------------------------------------------------
 * Author: Yurij Taranov
 * Website: https://find-ip.info/en/
 * ------------------------------------------------------------------------
 */
var PingTest = (function($, w ,d){
	return {
		init: function(args){
			var self = this;
			self.args = args || self.args;
			self.va = $(self.args.input || '#ip');
			self.ar = $(self.args.area || '#divid');
			self.sh = self.args.shell || '$';
			self.fl = self.args.file || 'ping.php';
			self.pi = self.args.count || 4;
			self.fi = self.args.finish || null;
			self.it = 0;
			self.rc = 0;
			self.rc = [];
			self.cl = '';
			self.ho = '';
			self.xhr = null;
			self.html(self.sh);
			self.va.prop('disabled', false);
			$(self.args.buttstart || '#start').click(function(){
				self.ip = self.va.val();
				if(self.ip){
					$(this).off();
					self.va.prop('disabled', true);
					self.ar.html('<div>' + self.messages(5, self.ip) + '</div>');
					self.data();
					$(self.args.buttstop || '#stop').click(function(){
						if(self.xhr !== null){
							$(this).off();
							self.xhr.abort();
							self.html('^C');
							self.html(self.messages(3, self.ho));
							self.done();
						}
					});
				}
			});
			self.va.on('input', function(){
				var ip = $(this).val();
				self.cl = self.messages(5, ip);
				self.ar.html('<div>' + self.cl + '</div>');
			});
		},
		html: function(text){
			$('<div>' + text + '</div>').appendTo(this.ar);
		},
		icmpSeq: function(data){
			this.rc.push(data.time);
			return this.html(data.bytes + ' bytes from ' + this.ho + ': icmp_seq=' + this.it + ' ttl=' + data.ttl + ' time=' + data.time + '  ms');
		},
		pingHandler: function(data){
			if(!this.resolver(data))
				return false;
			typeof data.error !== 'number' ? this.icmpSeq(data) : this.html(this.messages(data.error, this.ho || this.ip));
			if(++this.it > this.pi){
				this.html(this.messages(3, this.ho));
				this.done();
			}
			else{
				this.data();
			}
		},
		resolver: function(data){
			if(typeof data.error !== 'number' && typeof data.host !== 'undefined'){
				this.ho = data.host;
				this.html(this.messages(4, this.ho));
				this.data();
				return false;
			}
			if(typeof data.error === 'number' && data.error === 1){
				this.html(this.messages(data.error, this.ip));
				this.done();
				return false;
			}
			return true;
		},
		messages: function(m, h){
			if(m === 1)
				return 'ping: cannot resolve ' + h +': Unknown host';
			else if(m === 2)
				return 'ping: ' + h +': Packet loss';
			else if(m === 3)
				return '--- ' + this.ip + ' ping statistics ---<br />' + this.it + ' packets transmitted, ' + this.rc.length + ' packets received, ' + 
				((this.rc.length ? ((this.it - this.rc.length) / this.rc.length) : (this.it ? 1 : 0)) * 100).toFixed(1) + '% packet loss<br />' +
				(this.rc.length ? ('round-trip min/avg/max/stddev = ' + this.min(this.rc) + '/' + this.avg(this.rc) + '/' + this.max(this.rc) + '/' + this.stdDev(this.rc) + ' ms') : '');
			else if(m === 4)
				return 'PING ' + this.ip + ' (' + h + '): 56 data bytes';
			else if(m === 5)
				return this.sh + ' ' + (h ? 'ping -c ' + (this.pi + 1) + ' ' + h : '');
		},
		done: function(){
			if(typeof this.fi === 'function'){
				this.fi();
			}
			this.init();
		},
		data: function(){
			var self = this;
			$.ajax({
				type: "POST",
				url: self.fl + '?a=' + (self.ho !== '' ? 'ping' : 'resolv'),
				data: JSON.stringify({ip: self.ho || self.ip}),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				beforeSend: function(xhr){
					self.xhr = xhr;
				}
			}).done(function(data){
				self.pingHandler(data);
			});
		},
		stdDev: function(arr){
			var avg = this.avg(arr);
			var squareDiffs = arr.map(function(value){
				var diff = value - avg;
				var sqrDiff = diff * diff;
				return sqrDiff;
			});
			var avgSquareDiff = this.avg(squareDiffs);
			var stdDev = Math.sqrt(avgSquareDiff);
			return parseFloat(stdDev.toFixed(3));
		},
		max: function(arr) {
			return arr.length ? Math.max.apply(null, arr) : 0;
		},
		min: function(arr) {
			return arr.length ? Math.min.apply(null, arr) : 0;
		},
		avg: function (arr) {
			var sum = 0, j = 0; 
			for (var i = 0; i < arr.length, isFinite(arr[i]); i++) { 
				sum += parseFloat(arr[i]); ++j; 
			} 
			return parseFloat((j ? sum / j : 0).toFixed(3)); 
		}
	}
})(jQuery, window, document);
