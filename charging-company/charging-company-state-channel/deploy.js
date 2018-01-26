let fs = require("fs");
let Web3 = require('web3'); // https://www.npmjs.com/package/web3

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Read the compiled contract code
// Compile with
// solc Contract.sol --combined-json abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc > contract.json
let source = fs.readFileSync("chargingCompanyStateChannel.json");
let contracts = JSON.parse(source)["contracts"];


var chargingContract = 'chargingCompanyStateChannel.sol:ChargingCompany';//chargingCompany.sol:ChargingCompany // chargingCompany.sol:Mortal
// for (var contract1 in contracts) {
//     console.log(contract1);}

// ABI description as JSON structure
let abi = JSON.parse(contracts[chargingContract].abi);

// Smart contract EVM bytecode as hex
let code = contracts[chargingContract].bin;

// Create Contract proxy class
// https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
let contract = new web3.eth.Contract(abi)

// console.log(contract);
// Unlock the owner account to make transactions out of it
// console.log("Unlocking main account, accounts[0]");
var owner="0x2e4bf531ea8d0575bbfb2794d329a435426260b5";//0x627628ae925413d7412b37b52d80f30f3badca69
var password = "test";
web3.eth.personal.unlockAccount(owner, password).then(function(){
    console.log("owner: "+ owner);
    console.log("Deploying the contract");
    // contract.options.address = owner;
    contract.options.gas = 4700000;//if it fails, increase it
    contract.options.data= '0x'+code;
    // contract.deploy();
    contract.deploy().send({from:owner})
	.on('error', function(error){ console.log("an error occurred");console.log(error); })
	.on('transactionHash',
	    function(transactionHash){
		// Transaction has entered to geth memory pool
		console.log("Your contract is being deployed in transaction at http://rinkeby.etherscan.io/tx/" + transactionHash);}
	   )
	.on('receipt', function(receipt){
	    console.log("got new receipt:");
	    console.log(receipt); // contains the new contract address
	})
    // .on('confirmation', function(confirmationNumber, receipt){
    //     console.log("confirmation number: " + confirmationNumber);})
	.then(function(newContractInstance){
	    console.log("New Contract Instance:");
	    console.log(newContractInstance.options.address); // instance with the new contract address
	    console.log(newContractInstance.options); // instance with the new contract address
	    //console.log(newContractInstance); // instance with the new contract address
	    console.log(newContractInstance.options.jsonInterface); // instance with the new contract address
	});;
});
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
