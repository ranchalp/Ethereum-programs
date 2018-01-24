// Load the TCP Library
net = require('net');
constants = require('./tcp_constants.js');
let fs = require("fs");
let Web3 = require('web3'); // https://www.npmjs.com/package/web3
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
let source = fs.readFileSync("chargingCompanyRawTx.json");
let contracts = JSON.parse(source)["contracts"];
var chargingContract = 'chargingCompanyRawTx.sol:ChargingCompany';
// ABI description as JSON structure
let abi = JSON.parse(contracts[chargingContract].abi);
let contractAddress = constants.contractAddress// obtain from deployment
let contract = new web3.eth.Contract(abi,contractAddress);

// Keep track of the client
var client;
var fundsLocked = 0;
var valueLocked = 0;
var timestamp = 86400*5*1000;//5 days in ms
var fuelPrice=1; //price for fuel in tokens
var txDecoder = require('ethereum-tx-decoder'); // https://github.com/GFJHogue/ethereum-tx-decoder
var userAddress;
// Start a TCP Server
net.createServer(function (socket) {

    // Identify the client
    socket.name = socket.remoteAddress + ":" + socket.remotePort 

    // Send a nice welcome message and announce
    
    //socket.write("Welcome " + socket.name + "\n");
    var toWrite = {message: constants.FUEL_PRICE,
		   fuelPrice: fuelPrice,
		   stationAddress:constants.station1};
    socket.write(JSON.stringify(toWrite));

    // Handle incoming messages from clients.
    socket.on('data', function (data) {
	console.log('Received: ' + data);
	var dataJson = JSON.parse(data);
	console.log('json: ' + dataJson);
	switch(dataJson.message) {
	case constants.LOCKED_FUNDS:// fuelPrice
	    hash = dataJson.txhash;
	    // contract.once('channelOpened', {filter: {user: dataJson.address, station: constants.station1}},(error,event)=>{
	    // 	console.log('ERROR: ');
	    // 	console.log(error);
	    // 	console.log('EVENT: ');
	    // 	console.log(event);
	    // 	console.log(dataJson.txhash);
	    // 	if(event.txhash == dataJson.txhash &&
	    // 	   event.returnValues.user == dataJson.address &&
	    // 	   event.returnValues.station == constants.station1
	    // 	  ){//we assume no double-spending attack, no need to wait 6 confirmations (to-do)
	    //TODO FOR THE MOMENT WE ASSUME THIS WORKS AS EVENTS NOT SUPPORTED WITH WEB3.JS YET
			userAddress= dataJson.address;
		    date = new Date();
		    fundsLocked = date.getTime();
	    fundsLocked += timestamp;
	    
	    valueLocked = 1000;//event.returnValues._value;//TODO CHANGE
		    var toWrite = {message: constants.START_TRANSFER_OK,
				   maxTokens: valueLocked,//to-do used this and unitsRawTx
				   unitsRawTx:100//evth 100 units of fuel one new tx must arrive
				  };
		    socket.cork();
		    socket.write(JSON.stringify(toWrite));
		    process.nextTick(function(stream) {
			stream.uncork();
		    }, socket);
		// }else{
		//     console.log('error, hashes do not match');
		// }
		
	    initiateTransfer();// simulation of fuel going to car
	    // })
            break;
	case constants.OK:// fuelPrice
	    if(checkRawTx(dataJson.rawTx,dataJson.data,dataJson.tokenAmount,dataJson.timestamp))
		if(!transfer(100,dataJson.timestamp))
		    console.log("error transferring");
	    ;break;
	case constants.END:// fuelPrice
	    if(checkRawTx(dataJson.rawTx,dataJson.data,dataJson.tokenAmount,dataJson.timestamp))//when calling function
		//TODO
		//send first another tx to enable this one, with hash
		console.log("sendingRawTx");
		web3.eth.sendSignedTransaction(dataJson.rawTx).on('transactionHash',
								 function(transactionHash){
		    						     // Transaction has entered to geth memory pool
								     console.log("The raw transaction is can be seen at http://rinkeby.etherscan.io/tx/" + transactionHash);}
								).on('receipt', console.log).then(console.log);//
	    ;break;
	default:
	    console.log('hit default in switch');
            //code block
	}
	

		});

    // Remove the client from the list when it leaves
    socket.on('end', function () {
	socket = undefined;
	
    });
    

}).listen(5000);

// Put a friendly message on the terminal of the server.
console.log("Chat server running at port 5000\n");

// http://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var transferredAmount;
function initiateTransfer(){
    transferredAmount=0;
    //Transfer// Start a TCP Server
    net.createServer(function (socket) {

	client = socket;
	// Identify the client
	client.name = client.remoteAddress + ":" + client.remotePort 
	date = new Date();
	transfer(100,date.getTime()+timestamp);//todo change
	// Handle incoming messages from clients.
	// client.on('data', function (data) {
	// });
	// Remove the client from the list when it leaves
	client.on('end', function () {
	    client = undefined; 
	});
	

    }).listen(5001);
    // Put a friendly message on the terminal of the server.
    console.log("Transfer simulation server running at port 5000\n");

}


function transfer(amount,timeout){
    console.log("transferring amount");
    transferredAmount+=100;
    date = new Date();
    if(date.getTime()<timeout){
	client.cork();
	client.write(amount.toString(10));
	process.nextTick(function(stream) {
	    stream.uncork();
	}, client);
	console.log("done");
	return true;
    }
    console.log("error");
    return false;
}

function checkRawTx(rawTx,data,tokenAmount,signed_timestamp){
    console.log("checking rawTx");
    // console.log("address:"+web3.eth.accounts.recoverTransaction(rawTx));
    // console.log("actual useraddress:"+ userAddress);
    if(userAddress.toUpperCase() ==web3.eth.accounts.recoverTransaction(rawTx).toUpperCase()){
	console.log("userAddress correct");
	var decodedTx = txDecoder.decodeTx(rawTx);
	// console.log("data:");
	// console.log(data);
	if(data==contract.methods.finishCharge(tokenAmount,constants.station1,signed_timestamp).encodeABI()){
	    console.log("datafield correct");
	    // console.log("signed_timestamp:");
	    // console.log(signed_timestamp);
	    date = new Date();
	    if(date.getTime()+60*60*1000<signed_timestamp){//1hour in ms
		console.log("timestamp correct");
		//the rest of the values could be calculated as well
		//we assume (for now) the rest are ok (gasPrice etc., this is the easy part)
		//to-do check them as well
		console.log("works as expected");
		return true;
	    }
	};
    }
    console.log("does not work as expected");
    return false;
    
}






