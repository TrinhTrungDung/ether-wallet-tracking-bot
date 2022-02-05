const Web3 = require('web3');
require('dotenv').config();

const w3 = new Web3(new Web3.providers.WebsocketProvider(process.env.WSS_NODE));

console.log(w3.utils.toAscii('0xa9059cbb000000000000000000000000211b651a97a37fe77a5ed1f91c2c2f10589efd29000000000000000000000000000000000000000000000000000000001d71d780'));
console.log(w3.utils.sha3('transfer(address,uint256)'));
w3.eth.getCode('0x28c6c06298d514db089934071355e5743bf21d60');