/*
And connect with a tcp client from the command line using netcat, the *nix 
utility for reading and writing across tcp/udp network connections.  I've only 
used it for debugging myself.
$ netcat 127.0.0.1 1337
You should see:
> Echo server
*/

/* Or use this example tcp client written in node.js.  (Originated with 
example code from 
http://www.hacksparrow.com/tcp-socket-programming-in-node-js.html.) */

var net = require('net');

var client = new net.Socket();
var i=0;
client.connect(5000, '127.0.0.1', function() {
    console.log('Connected');
    // console.log('i: '+i);
    // client.cork();
    // client.write('0xf86a018601d1a94a20008347b76094847c4a264a3765b81b73d32f3b856cfc7c52ca9080845b3b136a2ca0e116f84357566c9757141a6e16824422dc798519c17173037e34fe75e29a16c8a036abf9893c0e68a823107fb0aa81d2147e6a9ded0854c6face12f041f0c4f996');
    // process.nextTick(function(stream) {
    // 	stream.uncork();
    // }, client);
});

client.on('data', function(data) {
    console.log('Received: ' + data);
    i++
    console.log('another one: '+i);
    client.cork();
    client.write('0xf86a018601d1a94a20008347b76094847c4a264a3765b81b73d32f3b856cfc7c52ca9080845b3b136a2ca0e116f84357566c9757141a6e16824422dc798519c17173037e34fe75e29a16c8a036abf9893c0e68a823107fb0aa81d2147e6a9ded0854c6face12f041f0c4f996');
    process.nextTick(function(stream) {
	stream.uncork();
    }, client);
	// client.destroy(); // kill client after server's response
});

// client.on('close', function() {
// 	console.log('Connection closed');
// });

// http://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
