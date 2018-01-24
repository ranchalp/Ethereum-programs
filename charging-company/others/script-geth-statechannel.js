var web3 = require ('web3')
var first_part = web3.utils.sha3("testingStateChannel(uint256)").slice(0,10)
var attr = "0x0000000000000000000000000000000000000000000000000000000000000003"//3
var both_concat = "0xb794156e0000000000000000000000000000000000000000000000000000000000000123"
// const keythereum = require('keythereum');
// const address = '0x9e378d2365b7657ebb0f72ae402bc08812022211';


const keythereum = require('keythereum');
const address = '0x45a6b16e1abd4e3786d39eb11214ba1fe57c5f48';
const datadir = '/home/ranchal/rinkeby';
var keyObject = keythereum.importFromFile(address, datadir);
// const password = 'test';
// let str;
// keythereum.importFromFile(address, datadir, function (keyObject) {
//   keythereum.recover(password, keyObject, function (privateKey) {
//     console.log(privateKey.toString('hex'));
// //05a20149c1c76ae9da8457435bf0224a4f81801da1d8204cb81608abe8c112ca  
//   });
// });

const ethTx = require('ethereumjs-tx');

const txParams = {
    nonce: '0x00', // Replace by nonce for your account on geth node
    gasPrice: '0x09184e72a000', 
    gasLimit: '0x30000',
    to: '0xfa3caabc8eefec2b5e2895e5afbf79379e7268a7', 
    value: '0x00',
    chainId: 4,
    data: '0xb794156e0000000000000000000000000000000000000000000000000000000000000123'
};
// Transaction is created
var tx = new ethTx(txParams);

// const privKey = Buffer.from('05a20149c1c76ae9da8457435bf0224a4f81801da1d8204cb81608abe8c112ca', 'hex');
var privKey = keythereum.recover('test', keyObject);
// Transaction is signed
tx.sign(privKey);
const serializedTx = tx.serialize();
const rawTx = '0x' + serializedTx.toString('hex');
console.log(rawTx)
