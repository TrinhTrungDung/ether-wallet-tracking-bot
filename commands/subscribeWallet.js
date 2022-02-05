const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subscribe')
        .setDescription('Subscribe to an EVM-compatible wallet')
        .addChannelOption(option =>
            option.setName('destination')
                .setDescription('Choose channel destination')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('network')
                .setDescription('Choose the network')
                .setRequired(true)
                .addChoice('Ethereum', 'eth')
                .addChoice('Binance Smart Chain', 'bsc')
                .addChoice('Polygon', 'matic'))
        .addStringOption(option =>
            option.setName('address')
                .setDescription('Copy the address here')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Any arbitrary name')
                .setRequired(false)),
    async execute(interaction) {
        const dest = interaction.options.getChannel('destination');
        const network = interaction.options.getString('network');
        const address = interaction.options.getString('address');
        const name = interaction.options.getString('name', false);
        const addressesFile = './data/addresses.json';

        try {
            const webhooks = await dest.fetchWebhooks();
            const webhook = webhooks.find(wh => wh.token);
            // Create new webhook if it does not exist yet
            if (!webhook) {
                dest.createWebhook('EtherWallet Tracking Bot', {
                    avatar: '',
                });
            }
        } catch (error) {
            console.error('Error trying to create webhook: ', error);
        }

        fs.readFile(addressesFile, 'utf8', (error, data) => {
            if (error) {
                return;
            }

            const json = JSON.parse(data);
            json.push({
                channelID: dest.id,
                network: network,
                address: address,
                name: name,
            });

            fs.writeFile(addressesFile, JSON.stringify(json), 'utf8', err => {
                if (err) console.error(err);
                console.log(`Subscribed to address ${address} (${name}) on ${network} network.`);
            });
        });

        if (!name) {
            await interaction.reply(`Subscribed to address ${address} on ${network} network.`);
        }

        await interaction.reply(`Subscribed to address ${address} (${name}) on ${network} network.`);
    },
};