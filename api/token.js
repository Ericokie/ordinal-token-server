const { RTCPeerConnection } = require('wrtc');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const username = req.query.username || `player_${Date.now()}`;

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });

  pc.createDataChannel("game");

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // Wait for ICE gathering
  await new Promise(r => setTimeout(r, 1200));

  const sdp = pc.localDescription.sdp;
  const lines = sdp.split('\r\n');

  let ufrag = '', pwd = '', fingerprint = '', candidate = '0.0.0.0:9';

  for (const line of lines) {
    if (line.startsWith('a=ice-ufrag:')) ufrag = line.slice(12);
    if (line.startsWith('a=ice-pwd:')) pwd = line.slice(10);
    if (line.startsWith('a=fingerprint:sha-256 ')) fingerprint = line.slice(22).replace(/:/g, '');
    if (line.startsWith('a=candidate:') && line.includes('typ host')) {
      const parts = line.split(' ');
      candidate = `${parts[4]}:${parts[5]}`;
    }
  }

  const token = `O,${username},${ufrag},${pwd},${fingerprint},${candidate}`;

  res.send(token);
};
