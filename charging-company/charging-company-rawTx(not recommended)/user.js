var net = require('net');
constants = require('./tcp_constants.js');
var readlineSync = require('readline-sync');
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

var fuelAmount;
var maxTokens;
var client = new net.Socket();
var stationAddress;
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
    var dataJson = JSON.parse(data);
    console.log('json: ' + dataJson);
    switch(dataJson.message) {
    case constants.FUEL_PRICE:// fuelPrice
	fuelAmount = readlineSync.question('Price in this station: '+dataJson.message.fuelPrice+' fuel units per token,\n how much fuel do you want?');
	stationAddress = dataJson.stationAddress;
	lockFunds(fuelAmount+constants.TOKEN_FINE,dataJson.stationAddress);
	// client.cork();
	// client.write('0xf86a018601d1a94a20008347b76094847c4a264a3765b81b73d32f3b856cfc7c52ca9080845b3b136a2ca0e116f84357566c9757141a6e16824422dc798519c17173037e34fe75e29a16c8a036abf9893c0e68a823107fb0aa81d2147e6a9ded0854c6face12f041f0c4f996');
	// process.nextTick(function(stream) {
	//     stream.uncork();
	// }, client);
	
        break;
    case constants.START_TRANSFER_OK:// fuelPrice
	maxTokens = dataJson.maxTokens;
	initiateTransfer(client);
	// client.cork();
	// client.write('0xf86a018601d1a94a20008347b76094847c4a264a3765b81b73d32f3b856cfc7c52ca9080845b3b136a2ca0e116f84357566c9757141a6e16824422dc798519c17173037e34fe75e29a16c8a036abf9893c0e68a823107fb0aa81d2147e6a9ded0854c6face12f041f0c4f996');
	// process.nextTick(function(stream) {
	//     stream.uncork();
	// }, client);	
        break;
    default:
      //  code block
    } 
	// client.destroy(); // kill client after server's response
});

// client.on('close', function() {
// 	console.log('Connection closed');
// });

// http://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function lockFunds(fuelAmount,station){// we assume enough amount of Tokens by now (to-do)
    var pwd = readlineSync.question('Write password for your address '+ constants.user1+'\n', {
	hideEchoBack: true // The typed text on screen is hidden by `*` (default). 
    });
    web3.eth.personal.unlockAccount(constants.user1, pwd,0).then(()=>{
	contract.methods.openChannel(fuelAmount,station).send({from:constants.user1}).on('transactionHash', (hash) => {
	    var toWrite = {message: constants.LOCKED_FUNDS,
			   txhash: hash,
			   address: constants.user1};
	    client.cork();
	    client.write(JSON.stringify(toWrite));
	    process.nextTick(function(stream) {
		stream.uncork();
	    }, client);	
	}).on('error',(error)=>{
	    console.log("error when sending openChannel function:");
	    console.log(error);
	});
    });
    
}


//Transfer// Start a TCP Server
var totalFuel;
function initiateTransfer(client,desiredAmount){
    totalFuel=0;
    client_transfer= new net.Socket();
    client_transfer.connect(5001, '127.0.0.1', function() {
	console.log('Transferring socket connected');
    });
    client_transfer.on('data', function(data) {
	console.log('Received: ' + data);
	new_fuel = parseInt(data,10);
	totalFuel+=new_fuel;
	if(totalFuel<maxTokens){//send new RawTx without requesting end
	    date = new Date();
	    var timestamp = date.getTime()+70*60*1000;//1 hour 10mins
	    var data = contract.methods.finishCharge(totalFuel,stationAddress,timestamp).encodeABI();

	    // console.log("sending data: "+data);
	    console.log("value:" + totalFuel);
	    var rawTX = {
		from: constants.user1,
		to: contractAddress,
		value: totalFuel,
		gas: "4700000",//weis
		gasPrice: "200000000000",//some weird unit below weis
		data: data,
	    };
//	    web3.eth.personal.unlockAccount(user2, 'test').then(function(){ we assume unlockked already
	    var result = web3.eth.signTransaction(rawTX, constants.user1).then(function(_signed_tx){
		
		fundsLocked = date.getTime();
		var toWrite = {message: constants.OK,
			       data:data,
			       rawTx:_signed_tx.raw,
			       tokenAmount: totalFuel,
			       timestamp: timestamp};
		client.cork();
		client.write(JSON.stringify(toWrite));
		process.nextTick(function(stream) {
		    stream.uncork();
		}, client);	
	    });
	}
	if(totalFuel>=maxTokens){//finished
	    date = new Date();
	    var timestamp = date.getTime()+70*60*1000;//1 hour 10mins
	    var data = contract.methods.finishCharge(totalFuel,stationAddress,timestamp).encodeABI();
	    console.log("value: "+ totalFuel);
	    var rawTX = {
		from: constants.user1,
		to: contractAddress,
		value: totalFuel,
		gas: "4700000",//weis
		gasPrice: "200000000000",//some weird unit below weis
		data: data
	    };
	    //	    web3.eth.personal.unlockAccount(user2, 'test').then(function(){ we assume unlockked already
	    var result = web3.eth.signTransaction(rawTX, constants.user1).then(function(_signed_tx){
		var toWrite = {message: constants.END,
			       rawTx:_signed_tx.raw,
			       data:data,
			       tokenAmount: totalFuel,
			       timestamp: timestamp};
		client.cork();
		client.write(JSON.stringify(toWrite));
		process.nextTick(function(stream) {
		    stream.uncork();
		}, client);	
	    });
	}
    });
}
    
    // console.log('i: '+i);
    // client.cork();
    // client.write('0xf86a018601d1a94a20008347b76094847c4a264a3765b81b73d32f3b856cfc7c52ca9080845b3b136a2ca0e116f84357566c9757141a6e16824422dc798519c17173037e34fe75e29a16c8a036abf9893c0e68a823107fb0aa81d2147e6a9ded0854c6face12f041f0c4f996');
    // process.nextTick(function(stream) {
    // 	stream.uncork();
    // }, client);


