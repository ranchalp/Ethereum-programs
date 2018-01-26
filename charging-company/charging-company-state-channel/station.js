// Load the TCP Library

net = require('net');
constants = require('./tcp_constants.js');
let fs = require("fs");
let stateChannel = require('./state_channel.js');
let Web3 = require('web3'); // https://www.npmjs.com/package/web3
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
let source = fs.readFileSync("chargingCompanyStateChannel.json");
let contracts = JSON.parse(source)["contracts"];
var chargingContract = 'chargingCompanyStateChannel.sol:ChargingCompany';
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
	    // contract.once('channelOpened', {filter: {user: dataJson.address, station: constants.station1}},(error,event)=>{
	    // 	console.log('ERROR: ');
	    // 	console.log(error);
	    // 	console.log('EVENT: ');
	    // 	console.log(event);
	    // 	console.log(dataJson.txhash);
	    // 	if(event.txhash == dataJson.txhash &&
	    // 	   event.returnValues.user == dataJson.address &&
	    // 	   event.returnValues.station == constants.station1
	    // 	  ){
	    //TODO FOR THE MOMENT WE ASSUME THIS WORKS AS EVENTS NOT SUPPORTED WITH WEB3.JS YET            // can also be done with getChannelTimeout though:
	    hash = dataJson.txhash;
	    
	    contract.methods.getChannelTimeout(dataJson.address,constants.station1,dataJson.tokenAmount).call({from:constants.station1}).then((result)=>{
		console.log("result: "+result*1000);
		date = new Date();
		var check = date.getTime();
		check += timestamp;
		console.log("min timeout: "+check);
		if(result*1000 >check){//correct
	
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
		}else{
		console.log("ERROR: channel is not open with proper timestamp");
		}});
	    // })
		;break;
	case constants.OK:// fuelPrice
	    checkData(dataJson).then((result)=>{
		if(result)
		{
		console.log("proceed");
		if(!transfer(100,dataJson.timestamp))
		    console.log("error transferring");
		}});
	    ;break;
	case constants.END:// fuelPrice
	    checkData(dataJson).then((result)=>{
		if(result){//when calling function
		    web3.eth.personal.unlockAccount(constants.station1, "test",0).then(()=>{
			console.log("commiting to close channel and closing it");
			console.log("calling commitToClose() with: " +userAddress+", "+dataJson.tokenAmount+", "+dataJson.timestamp+", "+dataJson.dataHash);
			contract.methods.isNotCommitted(userAddress).call().then((result)=>{
			    console.log("result not commited: "+result);
				contract.methods.checktimestampF(dataJson.timestamp).call().then((result)=>{
				    console.log("result timestamp: "+result);
				    contract.methods.verify_hashF(dataJson.tokenAmount,dataJson.timestamp,dataJson.dataHash).call().then((result)=>{
					console.log("result verify hash: "+result);
	    				contract.methods.commitToClose(userAddress,dataJson.tokenAmount, dataJson.timestamp,dataJson.dataHash).send({from:constants.station1,gas: "4700000",gasPrice: "400000000000"}).on('transactionHash',
	    																			  function(transactionHash){
	    	    																		      // Transaction has entered to geth memory pool
	    																			      console.log("The commitToClose transaction is can be seen at http://rinkeby.etherscan.io/tx/" + transactionHash);}
	    																										 ).on('receipt', console.log).then((result)=>{console.log("got receipt for commitToClose");console.log(result);});//
			waitTillCommitted(userAddress,dataJson);
				    });});});
		    });}});
	    ;break;
	default:
	    console.log('hit default in switch');
            //code block
	
	}
				    

    // Remove the client from the list when it leaves
    socket.on('end', function () {
	socket = undefined;
	
    });
    });
	

}).listen(5000);

// Put a friendly message on the terminal of the server.
console.log("Server running at port 5000\n");

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

function checkData(dataJson){
    return new Promise(function(resolve) {
	// do a thing, possibly async, then…
	var returnValue = false;
	console.log("checking data");
	console.log("dataJson:");
	console.log(dataJson);
	// console.log("address:"+web3.eth.accounts.recoverTransaction(rawTx));
	// console.log("actual useraddress:"+ userAddress);
	stateChannel.get_signer(dataJson.dataHash,dataJson.signature).then((signer_address)=>{
	    console.log("signer address:"+signer_address);
	    console.log("userAddress:"+userAddress);
	    if(stateChannel.verifyAll(dataJson.tokenAmount,dataJson.timestamp,dataJson.dataHash,userAddress,signer_address)){
		//verified
		// console.log("verified");
		// console.log(dataJson.tokenAmount+" "+constants.station1+" "+dataJson.timestamp);
		    // console.log("signed_timestamp:");
		    // console.log(signed_timestamp);
		    date = new Date();
		    if(date.getTime()+60*60*1000<dataJson.timestamp){//1hour in ms
			console.log("timestamp correct");
			//the rest of the values could be calculated as well
			//we assume (for now) the rest are ok (gasPrice etc., this is the easy part)
			//to-do check them as well
			console.log("works as expected");
			returnValue = true;
		}
	    }

	    if(!returnValue)
		console.log("does not work as expected");
	    
	    resolve(returnValue);
	});
    });
}


function waitTillCommitted(user,dataJson){
	contract.methods.getHash(user).call({from:constants.station1}).then((result)=>{
	    console.log("result: "+result);
	    if(result!=0){//correct
	    	[r,s,v] = stateChannel.rsv_generate(dataJson.signature);
	    	console.log("calling closeChannel() with: "+userAddress+","+v+", "+r+", "+s);
	    	contract.methods.closeChannel(userAddress,v, r,s).send({from:constants.station1,gas: "4700000",gasPrice: "400000000000"}).on('transactionHash',
	    											     function(transactionHash){
	    	    											 // Transaction has entered to geth memory pool
	    												 console.log("The closeChannel transaction is can be seen at http://rinkeby.etherscan.io/tx/" + transactionHash);}
	    											    ).on('receipt', console.log).then(console.log);//
	    }else{
	    	console.log("waiting 30 seconds...");
	    	sleep(30*1000).then(()=>{//wait 30 seconds
	    	    waitTillCommitted(user,dataJson);
	    	});
	    }	    
    });
}
