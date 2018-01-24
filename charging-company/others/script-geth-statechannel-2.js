//https://ethereum.stackexchange.com/questions/3386/create-and-sign-offline-raw-transactions
RLPrawtx= accounts.signTransaction({
        nonce: '0x00', // Replace by nonce for your account on geth node
    gasPrice: '0x09184e72a000', 
    gasLimit: '0x30000',
    to: '0xfa3caabc8eefec2b5e2895e5afbf79379e7268a7', 
    value: '0x00',
    chainId: 4,
    data: '0xb794156e0000000000000000000000000000000000000000000000000000000000000123'
}, '0x44603f3c5d04804a827aef385a5fb54d424930ef5a2d4b41fc00e718f8d989')
