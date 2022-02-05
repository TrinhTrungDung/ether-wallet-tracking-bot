const fs = require('fs');
const { Client, Intents, MessageEmbed } = require('discord.js');
const Web3 = require('web3');
require('dotenv').config();
const { isAddress } = require('./utils');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const w3 = new Web3(new Web3.providers.WebsocketProvider(process.env.WSS_NODE));
let records;
const addressesFile = './data/addresses.json';

fs.readFile(addressesFile, (error, data) => {
    if (error) {
        return;
    }

    records = JSON.parse(data);
});

console.log(`Watching for list of addresses change on ${addressesFile}`);
fs.watch(addressesFile, (event, filename) => {
    if (filename && event === 'change') {
        fs.readFile(filename, (error, data) => {
            if (error) {
                return;
            }

            records = JSON.parse(data);
        });
    }
});

w3.eth.subscribe('pendingTransactions', (error) => {
    if (error) console.error(error);
})
.on('data', async txHash => {
    // TODO implement retry exponential backoff
    await w3.eth.getTransaction(txHash).then(async pendingTx => {
        if (!pendingTx) return;
        // TODO get timestamp for mined transactions
        // if (!pendingTx.blockNumber) w3.eth.getBlock(pendingTx.blockNumber).timestamp

        for (const record of records) {
            const { from, to, hash, value } = pendingTx;
            // TODO extend use case of transactions
            // Monitor in and out transfers for an arbitrary address
            if (isAddress(record.address)) {
                // In-transfers case
                if (to && to.toLowerCase() === record.address) {
                    try {
                        const channel = await client.channels.fetch(record.channelID);
                        const webhooks = await channel.fetchWebhooks();
                        const webhook = webhooks.find(wh => wh.token);

                        const embed = new MessageEmbed()
                            .setTitle('Ethereum Blockchain Explorer')
                            .setURL(`https://etherscan.com/tx/${hash}`)
                            .setDescription(`Transaction hash ${hash}`);

                        const content = '';
                        await webhook.send({
                            content: content,
                            embeds: [embed],
                        });
                    } catch (error) {
                        console.error('Error trying to send a message: ', error);
                    }
                }
                // Out-transfers case
                else if (from && from.toLowerCase() === record.address) {
                    // Transfers native tokens to an arbitrary address
                    if (to && isAddress(to)) {
                        try {
                            const channel = await client.channels.fetch(record.channelID);
                            const webhooks = await channel.fetchWebhooks();
                            const webhook = webhooks.find(wh => wh.token);

                            const embed = new MessageEmbed()
                                .setTitle('Ethereum Blockchain Explorer')
                                .setURL(`https://etherscan.com/tx/${hash}`)
                                .setDescription(`Transaction hash ${hash}`);

                            const content = '';
                            await webhook.send({
                                content: content,
                                embeds: [embed],
                            });
                        } catch (error) {
                            console.error('Error trying to send a message: ', error);
                        }
                    }
                }
            } else {
                // TODO Monitor contract, extend later
            }
            if (isAddress(record.address)
                && (to && to.toLowerCase() === record.address
                    || from && from.toLowerCase() === record.address)) {
                try {
                    const channel = await client.channels.fetch(record.channelID);
                    const webhooks = await channel.fetchWebhooks();
                    const webhook = webhooks.find(wh => wh.token);

                    const embed = new MessageEmbed()
                        .setTitle('Ethereum Blockchain Explorer')
                        .setURL(`https://etherscan.com/tx/${hash}`)
                        .setDescription(`Transaction hash ${hash}`);
                    console.log(pendingTx);
                    const content = `Address ${from} sends to address ${to} ${w3.utils.fromWei(value, 'ether')} ETH`;
                    console.log(content);
                    await webhook.send({
                        content: content,
                        embeds: [embed],
                    });
                } catch (error) {
                    console.error('Error trying to send a message: ', error);
                }
            } else if (!isAddress(record.address)) {
                // TODO Monitor contract, extend later
            }
        }
    });
})
.on('changed', log => {
    console.log(log);
})
.on('error', error => {
    console.error(error);
});

// sub.unsubscribe((error, success) => {
//     if (success) {
//         console.log('Unsubscribed');
//     }
// });

client.login(process.env.DISCORD_TOKEN);