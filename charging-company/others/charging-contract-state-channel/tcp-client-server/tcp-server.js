// Load the TCP Library
net = require('net');

// Keep track of the chat clients
var client;

// Start a TCP Server
net.createServer(function (socket) {

    // Identify the client
    socket.name = socket.remoteAddress + ":" + socket.remotePort 

    // Send a nice welcome message and announce
    socket.write("Welcome " + socket.name + "\n");

    // Handle incoming messages from clients.
    var i=0;
    socket.on('data', function (data) {

	// Log it to the server output too
	process.stdout.write(data)
	console.log('\n done,'+ (i++)+' \n');
	sleep(5000).then(()=>{
	    // console.log(data);
	    socket.write('ok');
	});
    });

    // Remove the client from the list when it leaves
    socket.on('end', function () {
	client = undefined;
	
    });
    

}).listen(5000);

// Put a friendly message on the terminal of the server.
console.log("Chat server running at port 5000\n");

// http://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
