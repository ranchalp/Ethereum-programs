
var browser_untitled_sol_mortalContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]);
var browser_untitled_sol_mortal = browser_untitled_sol_mortalContract.new(
   {
     from: web3.eth.accounts[0], 
     data: '0x6060604052341561000f57600080fd5b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506101128061005e6000396000f300606060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806341c0e1b5146044575b600080fd5b3415604e57600080fd5b60546056565b005b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141560e4576000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b5600a165627a7a7230582038786419ebfaf0ece98c88b50b6e32f88f1a8f4154a51b4243d2e694d1f3d6bb0029', 
       gas: '4700000',
       gasPrice: '12100000000'
   }, function (e, contract){
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
var _greeting = "greeting_1" ;
var browser_untitled_sol_greeterContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"greet","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_greeting","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]);
var browser_untitled_sol_greeter = browser_untitled_sol_greeterContract.new(
   _greeting,
   {
     from: web3.eth.accounts[0], 
     data: '0x6060604052341561000f57600080fd5b6040516103a93803806103a983398101604052808051820191905050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508060019080519060200190610081929190610088565b505061012d565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106100c957805160ff19168380011785556100f7565b828001600101855582156100f7579182015b828111156100f65782518255916020019190600101906100db565b5b5090506101049190610108565b5090565b61012a91905b8082111561012657600081600090555060010161010e565b5090565b90565b61026d8061013c6000396000f30060606040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806341c0e1b514610051578063cfae321714610066575b600080fd5b341561005c57600080fd5b6100646100f4565b005b341561007157600080fd5b610079610185565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156100b957808201518184015260208101905061009e565b50505050905090810190601f1680156100e65780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415610183576000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b565b61018d61022d565b60018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156102235780601f106101f857610100808354040283529160200191610223565b820191906000526020600020905b81548152906001019060200180831161020657829003601f168201915b5050505050905090565b6020604051908101604052806000815250905600a165627a7a72305820f3de1b9c5ca8c5a68fe81d325e45de5106da744f892306190426fcbf7d323bc80029', 
       gas: '4700000',
       gasPrice: '211000000000'
   },
     function (e, contract){
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

var _greeting2 = "Hello World!"
var greeterContract = web3.eth.contract(JSON.parse(greeterCompiled.contracts["greeter.cpp:greeter"].abi));
var greeter = greeterContract.new(_greeting2,{from:web3.eth.accounts[0], data: greeterCompiled.contracts["greeter.cpp:greeter"].bin, gas: 1000000}, function(e, contract){
  if(!e) {

    if(!contract.address) {
      console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");

    } else {
      console.log("Contract mined! Address: " + contract.address);
      console.log(contract);
    }

  }
})
// var _greeting = "Hello World!"
// var greeterContract = web3.eth.contract(greeterCompiled.greeter.info.abiDefinition);
// o
// var greeter = greeterContract.new(_greeting,{from:web3.eth.accounts[0], data: greeterCompiled.greeter.code, gas: 1000000}, function(e, contract){
//   if(!e) {

//     if(!contract.address) {
//       console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");

//     } else {
//       console.log("Contract mined! Address: " + contract.address);
//       console.log(contract);
//     }

//   }
// })
