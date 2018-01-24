//after some negotiaton off-chain
//both user and station arrive to a common ground of:
// max tokens to spend
// negotiated price
// addresses of both
var user1 = '0x0c0fd5ad358680f71d3be56363fbe2f8f4b7b45a';
var tokensCharge = 100;
var negotiatedPrice = 1;
contract.methods.startCharge(tokensCharge,1,user1).send({from:station1}).then(function(result){console.log("Executed startCharge:");console.log(result);});

//wait for user to open channel, and then VERIFY channel is opened
// verify that channel is open is a TODO still

//suppose it receives the signature and the hash, now it can do the
//following to verify execution

var ok=false;
var signer; functions.get_signer(hash,signature)
    .then(
	function(_signer){
	    signer=_signer;
	    ok = verify(50,hash,user1,signer)
	    console.log("finished");
	    console.log("signer and message verified: " +ok);});

//additionally, it can even call the function itself from the smart contract (without spending by sending transaction)
var rsv = var rsv = functions.rsv_generate(signature);
contract.methods.finishCharge(user1,50,rsv[2],rsv[0],rsv[1]).call({from:station1}).then(function(result){console.log("Executed agreeStart2:");console.log(result);});//if ok then it worked
