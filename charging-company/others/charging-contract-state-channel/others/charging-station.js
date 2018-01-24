var value_station=100; //100kwatts
var h_station = web3.sha3(value);
var station= "0x43d5aa87d3da82308ee7962897ce6b8db56273c8";
personal.unlockAccount(station)
var sig_station = web3.eth.sign(station, h_station).slice(2)
var r_station = '0x' + sig_station.slice(0, 64)
var s_station = '0x' + sig_station.slice(64, 128)
var v_station = web3.toDecimal(parseInt("0x"+sig_station.slice(128,130))) // must be +27 of not 28 or 27
//var result_station = personal.ecRecover(h, "0x"+sig)
// send to user => value, station, result

var state_channel = {

    function sign(address, value){
	var hash = web3.sha3(value);
	var sig = web3.eth.sign(address, hash).slice(2);
	//var result_station = personal.ecRecover(h, "0x"+sig)
	// send to user => value, station, result
	var result = [hash,sig]
    }

    function rsv_generate(signature){
	var r = '0x' + signature.slice(0, 64);
	var s = '0x' + signature.slice(64, 128);
	var v = web3.toDecimal(parseInt("0x"+signature.slice(128,130))); // must be +27 of not 28 or 27
	return [r,s,v]
    }

    function verify(message, hash, signature, address) {
	var hashed_message = web3.sha3(message);
	var signer_address = personal.ecRecover(hash,signature);
	return (hashed_message == hash) && (signer_address == address);
    }
}
