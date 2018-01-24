const keythereum = require('keythereum');
var functions = require("./state_channel.js");
const datadir = '/home/ranchal/rinkeby';
var Web3 = require('web3');
var web3 = new Web3(Web3.givenProvider || new web3.providers.HttpProvider('http://localhost:8545'));
//web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
var address= '0x2e4bf531ea8d0575bbfb2794d329a435426260b5';
//var value = 2;
var hash = web3.utils.sha3(value.toString());
var results = functions.sign(address,value)
var verified; results[1].then(
    function(sig){
	functions.get_signer(hash,sig).then(
	    function(_signer){
		verified = functions.verify(value,hash,address,_signer)
	    })
    })		//signer_address = _signer

//TODO WHAT HAPPENS IF IT IS LOCKED?
//var unlocked; web3.eth.personal.unlockAccount(address,"test",15000).then(function(_unlocked){unlocked=_unlocked});

// ------------
// LOOK AT THIS
// ------------
// var Tx = require('ethereumjs-tx');
// var privateKey = new Buffer('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex')

// var rawTx = {
//   nonce: '0x00',
//   gasPrice: '0x09184e72a000',
//   gasLimit: '0x2710',
//   to: '0x0000000000000000000000000000000000000000',
//   value: '0x00',
//   data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057'
// }

// var tx = new Tx(rawTx);
// tx.sign(privateKey);

// var serializedTx = tx.serialize();

// // console.log(serializedTx.toString('hex'));
// // 0xf889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f

// web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
// .on('receipt', console.log);

// > // see eth.getTransactionReceipt() for details
