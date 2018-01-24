var mortalContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]);
var mortal = mortalContract.new(
   {
     from: web3.eth.accounts[0], 
     data: '0x6060604052341561000f57600080fd5b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506101128061005e6000396000f300606060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806341c0e1b5146044575b600080fd5b3415604e57600080fd5b60546056565b005b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141560e4576000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b5600a165627a7a7230582021a7543e1f3e538207d46ff172b95dca35d79018ddaf17dcae3e3962577792600029', 
     gas: '4700000'
   },      function (e, contract){
       if(!e) {
	   if(!contract.address) {
	       console.log("Contract1 transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");
	   } else {
	       console.log("Contract1 mined! Address: " + contract.address);
	       console.log(contract);
	   }
       }     else{   console.log(e);
		     console.log("HERE");
		 }     
   })

var simpleContractContract = web3.eth.contract([{"constant":true,"inputs":[],"name":"value","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"simpleValue","type":"uint256"}],"name":"testingStateChannel","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getSimpleValue","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]);
var simpleContract = simpleContractContract.new(
   {
     from: web3.eth.accounts[0], 
     data: '0x6060604052341561000f57600080fd5b6101098061001e6000396000f3006060604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633fa4f245146058578063b794156e14607e578063bedf6c8d14609e575b600080fd5b3415606257600080fd5b606860c4565b6040518082815260200191505060405180910390f35b3415608857600080fd5b609c600480803590602001909190505060ca565b005b341560a857600080fd5b60ae60d4565b6040518082815260200191505060405180910390f35b60005481565b8060008190555050565b600080549050905600a165627a7a7230582045238b8fffa1927bf4e1c27afeeec53574b1901eeba56d9e102c5c12ef984cd70029', 
     gas: '4700000'
   },function (e, contract){
       if(!e) {
	   if(!contract.address) {
	       console.log("Contract1 transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");
	   } else {
	       console.log("Contract1 mined! Address: " + contract.address);
	       console.log(contract);
	   }
       }     else{   console.log(e);
		     console.log("HERE");
		 }     
   })
