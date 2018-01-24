//require web3 (look at 'testing-nodejs.txt')
let Web3 = require('web3'); // https://www.npmjs.com/package/web3
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
module.exports = {
    sign: function(address, value){
	var hash = web3.utils.sha3(value.toString());
	var sig_promise = web3.eth.sign(hash,address);
	//var result_station = personal.ecRecover(h, "0x"+sig)
	// send to user => value, station, result
	var result = [hash,sig_promise];
	return result;
    },

    rsv_generate: function (signature){
	signature = signature.slice(2);
	var r = '0x' + signature.slice(0, 64);
	var s = '0x' + signature.slice(64, 128);
	var v = web3.utils.toDecimal(parseInt("0x"+signature.slice(128,130))); // must be +27 of not 28 or 27
	return [r,s,v]
    },

    get_signer: function (hash, signature) {
	var signer_address_promise = web3.eth.personal.ecRecover(hash,signature);
	return signer_address_promise;
    },
    
    get_signer: function (hash, r,s,v) {
	var signature = '0x'+r.slice(2)+''+s.slice(2)+v.toString(16);
	console.log('signature: '+signature);
	var signer_address_promise = web3.eth.personal.ecRecover(hash,signature);
	return signer_address_promise;
    },
    
    verify: function (message, hash, address,signer_address) {
	var hashed_message = web3.utils.sha3(message.toString());
	return (hash==hashed_message) && (signer_address == address);
    }
};

