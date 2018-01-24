var value_user=100; //100kwatts
var h_user = web3.sha3(value);
var user= "0x45a6b16e1abd4e3786d39eb11214ba1fe57c5f48";
personal.unlockAccount(user)
var sig_user = web3.eth.sign(user, h_user).slice(2)
var r_user = '0x' + sig_user.slice(0, 64)
var s_user = '0x' + sig_user.slice(64, 128)
var v_user = web3.toDecimal(parseInt("0x"+sig_user.slice(128,130))) // must be +27 of not 28 or 27
// to recover
// var result_user = personal.ecRecover(h, "0x"+sig)
// send to station => value, user, result 


