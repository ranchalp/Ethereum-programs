let fs = require("fs");
let Web3 = require('web3'); // https://www.npmjs.com/package/web3
let constants = require('./tcp_constants.js');
// Create a web3 connection to a running geth node over JSON-RPC running at
// http://localhost:8545
// For geth VPS server + SSH tunneling see
// https://gist.github.com/miohtama/ce612b35415e74268ff243af645048f4
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Read the compiled contract code
// Compile with
// solc Contract.sol --combined-json abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc > contracts.json
let source = fs.readFileSync("chargingCompanyStateChannel.json");
let contracts = JSON.parse(source)["contracts"];

var chargingContract = 'chargingCompanyStateChannel.sol:ChargingCompany';//chargingCompany.sol:ChargingCompany // chargingCompany.sol:Mortal
// for (var contract1 in contracts) {
//     console.log(contract1);}

// ABI description as JSON structure
let abi = JSON.parse(contracts[chargingContract].abi);

// Create Contract proxy class
// https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
let contractAddress = constants.contractAddress;//replace with new value
let contract = new web3.eth.Contract(abi,contractAddress);

var caller = constants.owner;
var result;

//Test that it works
contract.methods.getMyTokens().call({from:caller}).then(function(_result){result = _result;});

//add Stations
var station1 = constants.station1;
var station2 = constants.station2;

var password = "test";
web3.eth.personal.unlockAccount(caller, password).then(()=>{

    console.log("adding stations..."+station1+", "+station2);
    console.log("caller: "+caller);
    contract.methods.addStation(station1).send({from:caller}).on('transactionHash', function(hash){
	console.log("txhash: " + hash);
    }).then(function(_result){result = _result;});

    contract.methods.addStation(station2).send({from:caller}).on('transactionHash', function(hash){
	console.log("txhash: " + hash);
    }).then(function(_result){result = _result;});

});
var user1 = constants.user1;

var user2 = constants.user2;
//to send money to others
//var balance_user1; web3.eth.getBalance(user1).then(function(_balance){balance_user1=_balance;}); web3.eth.sendTransaction({from:user1,to:station2,value:tosend.toString()}).then(function(result){console.log(result)});

//purchase some tokens (only users)
var tokensToPurchase = 10000;
var tokenPrice;
console.log("let's purchase "+tokensToPurchase+" for account: "+user1);

web3.eth.personal.unlockAccount(user1, 'test').then((whatvs)=>{
    contract.methods.getTokenPrice().call()
	.then(
	    function(_result)
	    {
		tokenPrice = _result;
		contract.methods.purchaseTokens(tokensToPurchase).send({from:user1,value:tokensToPurchase*tokenPrice,gas: "4700000",gasPrice: "200000000000"}).on('transactionHash', function(hash){
		    console.log("txhash: " + hash);
		}).then(function(_result){result = _result;
					  console.log(result)});
	    });
});

//web3.eth.personal.unlockAccount(caller, password)
//var result; contract.methods.getMyTokens().send({from:caller}).then(function(_result){result = _result;})
// console.log(contract);
// Unlock the owner account to make transactions out of it
// console.log("Unlocking main account, accounts[0]");
// var owner; web3.eth.personal.getAccounts().
//     then(
// 	function(accounts){
// 	    owner = accounts[0];
// 	    var password = "test";
// 	    try {
// 		web3.eth.personal.unlockAccount(owner, password).then(function(){
// 		    	    console.log("owner: "+ owner);
// 	    console.log("Deploying the contract");
// 	    // contract.options.address = owner;
// 	    contract.options.gas = 4700000;//if it fails, increase it
// 	    contract.options.data= '0x'+code;
// 	    // contract.deploy();
// 	    contract.deploy().send({from:owner})
// 			.on('error', function(error){ console.log("an error occurred");console.log(error); })
// 			.on('transactionHash',
// 			    function(transactionHash){
// 		    		// Transaction has entered to geth memory pool
// 				console.log("Your contract is being deployed in transaction at http://rinkeby.etherscan.io/tx/" + transactionHash);}
// 			   )
// 			.on('receipt', function(receipt){
// 			    console.log("got new receipt:");
// 			    console.log(receipt); // contains the new contract address
// 			})
// 			// .on('confirmation', function(confirmationNumber, receipt){
// 			//     console.log("confirmation number: " + confirmationNumber);})
// 			.then(function(newContractInstance){
// 			    console.log("New Contract Instance:");
// 			    console.log(newContractInstance.options.address); // instance with the new contract address
// 			    console.log(newContractInstance.options); // instance with the new contract address
// 			    //console.log(newContractInstance); // instance with the new contract address
// 			    console.log(newContractInstance.options.jsonInterface); // instance with the new contract address
// 			});;
// 		});
								     
// 	    } catch(e) {
// 		console.log(e);
// 		return;
// 	    }

// 	});
// // http://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// // We need to wait until any miner has included the transaction
// // in a block to get the address of the contract
// async function waitBlock() {
//   while (true) {
//     let receipt = web3.eth.getTransactionReceipt(contract.transactionHash);
//     if (receipt && receipt.contractAddress) {
//       console.log("Your contract has been deployed at http://testnet.etherscan.io/address/" + receipt.contractAddress);
//       console.log("Note that it might take 30 - 90 sceonds for the block to propagate befor it's visible in etherscan.io");
//       break;
//     }
//     console.log("Waiting a mined block to include your contract... currently in block " + web3.eth.blockNumber);
//     await sleep(4000);
//   }
// }

// waitBlock();
