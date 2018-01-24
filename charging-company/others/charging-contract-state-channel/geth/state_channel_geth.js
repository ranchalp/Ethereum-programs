//just like state_channel.js but for geth,
// call with loadScript(...) instead of require(...) for nodejs with state_channel
function sign(address, value){
    var hash = web3.sha3(value.toString());
    var sig = web3.eth.sign(address, hash)
    //var result_station = personal.ecRecover(h, "0x"+sig)
    // send to user => value, station, result
    return [hash,sig];
}

function rsv_generate(signature){
    signature = signature.slice(2);
    var r = '0x' + signature.slice(0, 64);
    var s = '0x' + signature.slice(64, 128);
    var v = web3.toDecimal(parseInt("0x"+signature.slice(128,130))); // must be +27 of not 28 or 27
    return [r,s,v]
}

function verify(message, hash, signature, address) {
    var hashed_message = web3.sha3(message.toString());
    var signer_address = personal.ecRecover(hash,signature);
    return (hashed_message == hash) && (signer_address == address);
}

function verify(message, result, address) {
    var hash = result[0];
    var signature = result[1]
    var hashed_message = web3.sha3(message.toString());
    var signer_address = personal.ecRecover(hash,signature);
    return (hashed_message == hash) && (signer_address == address);
}
