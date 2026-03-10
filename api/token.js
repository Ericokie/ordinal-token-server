module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const username = req.query.username || `player_${Date.now()}`;

  // Generates token in EXACT same format as your friend's server
  const fakeSdp = `v=0
o=- ${Date.now()} 2 IN IP4 127.0.0.1
s=-
t=0 0
a=msid-semantic: WMS
m=application 9 UDP/DTLS/SCTP webrtc-datachannel
c=IN IP4 127.0.0.1
a=mid:0
a=sctp-port:5000
a=max-message-size:262144
a=setup:actpass
a=ice-ufrag:fakeufrag${Math.random().toString(36).slice(2,10)}
a=ice-pwd:fakepwd${Math.random().toString(36).slice(2,20)}
a=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00
a=candidate:1 1 UDP 2122260223 127.0.0.1 9 typ host
a=end-of-candidates`;

  const lines = fakeSdp.split('\n');
  let ufrag = '', pwd = '', fingerprint = '', candidate = '127.0.0.1:9';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('a=ice-ufrag:')) ufrag = trimmed.slice(12);
    if (trimmed.startsWith('a=ice-pwd:')) pwd = trimmed.slice(10);
    if (trimmed.startsWith('a=fingerprint:sha-256 ')) fingerprint = trimmed.slice(22).replace(/:/g, '');
    if (trimmed.startsWith('a=candidate:') && trimmed.includes('typ host')) {
      const parts = trimmed.split(' ');
      candidate = `${parts[4]}:${parts[5]}`;
    }
  }

  const token = `O,${username},${ufrag},${pwd},${fingerprint},${candidate}`;

  res.setHeader('Content-Type', 'text/plain');
  res.send(token);
};
