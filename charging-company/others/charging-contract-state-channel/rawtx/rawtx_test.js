let fs = require("fs");
let Web3 = require('web3'); // https://www.npmjs.com/package/web3
let functions = require('/home/ranchal/Dropbox/ITA-EIT/UPMC/SMS/blockchain-SMS/charging-contract-state-channel/nodejs/state_channel.js');
var RLP = require('ethers-utils/rlp');

var txDecoder = require('ethereum-tx-decoder'); // https://github.com/GFJHogue/ethereum-tx-decoder

// Create a web3 connection to a running geth node over JSON-RPC running at
// http://localhost:8545
// For geth VPS server + SSH tunneling see
// https://gist.github.com/miohtama/ce612b35415e74268ff243af645048f4
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Read the compiled contract code
// Compile with
// solc Contract.sol --combined-json abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc > contracts.json
let source = fs.readFileSync("/home/ranchal/Dropbox/ITA-EIT/UPMC/SMS/blockchain-SMS/charging-contract-state-channel/chargingCompany.json");
let contracts = JSON.parse(source)["contracts"];

var chargingContract = 'chargingCompany.sol:ChargingCompany';//chargingCompany.sol:ChargingCompany // chargingCompany.sol:Mortal
// for (var contract1 in contracts) {
//     console.log(contract1);}

// ABI description as JSON structure
let abi = JSON.parse(contracts[chargingContract].abi);

// Create Contract proxy class
// https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
let contractAddress = '0x847c4a264a3765b81b73d32f3b856cfc7c52ca90';
let contract = new web3.eth.Contract(abi,contractAddress);

var owner = '0x2e4BF531EA8d0575BBfb2794d329a435426260B5';
var caller = owner;
var result;

//Test that it works
web3.eth.personal.unlockAccount(owner, 'test').then(function(){
    contract.methods.getMyTokens().call({from:caller}).then(function(_result){result = _result;
									      console.log("it works");
									      console.log(_result)});
});

var data = contract.methods.getMyTokens().encodeABI();
console.log("data:" + data);
var signed_tx;

// var user1 = "0x0c0fd5ad358680f71d3be56363fbe2f8f4b7b45a";
var user2 = "0x9f4b9b97ea99cb2f09836af8478f671684dbea09";
var user1_tampered = "0x0c0fd5ad358680f71d3be56363fbe2f8f4b7b452";

var rawTX = {
    from: user2,
    to: contractAddress,
    value: "0",
    gas: "4700000",//weis
    gasPrice: "2000000000000",//some weird unit below weis
    data: data
};
console.log(rawTX);
web3.eth.personal.unlockAccount(user2, 'test').then(function(){
    var result = web3.eth.signTransaction(rawTX, user2).then(function(_signed_tx){
	signed_tx = _signed_tx;
	console.log("transaction has been signed");
	console.log(signed_tx);
	var decoded_tx = RLP.decode(signed_tx.raw);

	var [
	    raw_nonce,
	    raw_gasPrice,
	    raw_gasLimit,
	    raw_to,
	    raw_value,
	    raw_data,
	    raw_v,
	    raw_r,
	    raw_s
	] = decoded_tx;
	console.log('raw_v: '+raw_v);
	var decodedTx = txDecoder.decodeTx(signed_tx.raw);
	console.log(decodedTx);
	console.log('hash:');
	var hash = web3.utils.sha3(signed_tx.raw);
	console.log(hash);
	if(hash==decodedTx.hash);
	console.log('signer:')
	//check address==web3.eth.accounts.recoverTransaction('0xf86a1a8601d1a94a20008347b76094847c4a264a3765b81b73d32f3b856cfc7c52ca9080845b3b136a2ba03b45b5822e20a1affadf4b695251e734a7209cafb79972e2f3e01fd39c4a
	
	//we assume the rest to be just ok, although in reality one should need to check it
	functions.get_signer(hash,decodedTx.r,decodedTx.s,decodedTx.v-16).then((result)=>{console.log('HEREsigners:'+result);});//check address(hash) == address
	web3.eth.sendSignedTransaction(signed_tx.raw).on('transactionHash',
							 function(transactionHash){
		    					     // Transaction has entered to geth memory pool
							     console.log("Your contract is being deployed in transaction at http://rinkeby.etherscan.io/tx/" + transactionHash);}
							).on('receipt', console.log).then(console.log);
    });
});
// var result = web3.eth.signTransaction(rawTX, user2).then(function(_signed_tx){
//     signed_tx = _signed_tx;
//     console.log("transaction has been signed");
//     console.log(signed_tx);
//     var decodedTx = txDecoder.decodeTx(signed_tx.rawTransaction);
//     console.log(decodedTx);
//     web3.eth.sendSignedTransaction(signed_tx.rawTransaction).on('transactionHash',
// 			    function(transactionHash){
// 		    		// Transaction has entered to geth memory pool
// 				console.log("Your contract is being deployed in transaction at http://rinkeby.etherscan.io/tx/" + transactionHash);}
// 							       ).on('receipt', console.log).then(console.log);
// });

// // console.log(result);

// // web3.eth.signTransaction({
// //     from: user2,
// // gasPrice: "20000000000",
// // gas: "21000",
// // to: '0x3535353535353535353535353535353535353535',
// // value: "1000000000000000000",
// // data: ""
// // }).then(console.log);
