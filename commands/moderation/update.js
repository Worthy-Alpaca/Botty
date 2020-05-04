const { welcome_channel, version, status } = require("../../config.json");
const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");


module.exports = {
    name: "update",
    category: "moderation",
    description: "Updates the bot",
    run: async (client, message, args) => {
        message.delete();


        if (message.author.id !== "595341356432621573")
            return message.reply("You are not powerfull enough to command me in such a way!").then(m => m.delete(5000));
            
            
        await client.user.setPresence({
            status: "invisible",
            game: {
                name: `${status}`,
                type: "WATCHING"
            }
        });
        var channel = message.guild.channels.find(channel => channel.name === `${welcome_channel}`);

        setTimeout(() => {
            client.user.setPresence({
                status: "online", 
                game: {
                    name: `${status}`,
                    type: "WATCHING"
                }
            });

            
        }, 5000);
        
        setTimeout(() => {
            const embed2 = new RichEmbed()
            .setColor("Random")
            .setTimestamp()
            .setAuthor("Update occured", client.user.displayAvatarURL)
            .setDescription(stripIndents`I have been updated. :grin: 
            New version: **${version}**`);

            return channel.send(embed2);
 
        }, 6000)
        

    }
}