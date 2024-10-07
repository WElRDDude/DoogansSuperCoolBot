// bot.mjs

import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';

// Initialize the Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Your bot token
const token = 'MTI3NTExMDAxMzgxOTU1NjAyNA.GoGdmk.UtIeE4aDQEhbQtwT6CwJII_CUQS-2bzWDFYBNg';

// Command prefix
const prefix = '!slayer';

// Event listener for when the bot is ready
client.once('ready', () => {
    console.log('Bot is online!');
});

// Event listener for messages
client.on('messageCreate', async message => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Check if the message starts with the command prefix
    if (message.content.startsWith(prefix)) {
        // Extract the username from the message
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const username = args[0];

        if (!username) {
            message.channel.send('Please provide a username.');
            return;
        }

        try {
            // Fetch data from the SkyCrypt API
            // Refresh API Cache for the user
            await fetch(`https://sky.shiiyu.moe/stats/${username}`);
            const response = await fetch(`https://sky.shiiyu.moe/api/v2/slayers/${username}`);
            const rawText = await response.text();

            // Log the raw response text for debugging
            console.log('Raw API response:', rawText);

            // Parse the raw text as JSON
            const data = JSON.parse(rawText);

            // Extract the relevant profile data
            let selected_profile = null;
            const profiles = Object.values(data);
            // Iterate over all profiles to find the highest data
            profiles.forEach((profile) => {
                try {
                    if (profile.selected) {
                        selected_profile = profile;
                        
                    }
                } catch (error) {

                    console.error(`Error parsing profile data: ${error}`);
                }
                
                

            
            });

            


            if (!selected_profile || !selected_profile.data || !selected_profile.data.slayers) {
                message.channel.send('The API returned incomplete data.');
                return;
            }

            const slayers = selected_profile.data.slayers;

            // Create an embed message
            const embed = new EmbedBuilder()
                .setTitle(`Slayer Information for ${username}`)
                .setColor(0x00AE86)
                .addFields(
                    { name: 'Total Slayer XP', value: selected_profile.data.total_slayer_xp.toString(), inline: true },
                    { name: 'Total Coins Spent', value: selected_profile.data.total_coins_spent.toString(), inline: true }
                )
                .setTimestamp();

            // Add slayer details to the embed
            for (const [slayerType, slayerData] of Object.entries(slayers)) {
                embed.addFields(
                    { name: `${slayerData.name} Level`, value: slayerData.level.currentLevel.toString(), inline: true },
                    { name: `${slayerData.name} XP`, value: slayerData.level.xp.toString(), inline: true }
                );
            }

            // Send the embed message to the Discord channel
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching data:', error);
            message.channel.send('There was an error fetching the data.');
        }
    }

});

// Log in to Discord with your bot token
client.login(token);