const Web3 = require('web3');

require('dotenv').config();

const w3 = new Web3(new Web3.providers.WebsocketProvider(process.env.WSS_NODE));

module.exports = {
    isAddress: address => {
        if (w3.eth.getCode(address) === '0x') {
            return true;
        }

        return false;
    },
};