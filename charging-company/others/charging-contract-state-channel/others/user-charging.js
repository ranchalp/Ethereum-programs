// after station called startCharge
//
contract.methods.agreeStart(100).send({from:user1}).then(function(result){console.log("Executed agreeStart2:");console.log(result);});

//wait for execution
//.....

//lets say they spend 50 in the end
result = functions.sign(user1,50);
var signature; result[1].then(function(_sig){signature=_sig;});
var hash = result[0];
//this two values can be sent to the station

//notice only because I own the keys can I sign
//user1_tampered = '0x0c0fd5ad358680f71d3be56363fbe2f8f4b7b48a'
//user1_tampered = '0x0c0fd5ad358680f71d3be56363fbe2f8f4b7b48a'
//'0x0c0fd5ad358680f71d3be56363fbe2f8f4b7b48a'
//result2 = functions.sign(user1_tampered,50);

