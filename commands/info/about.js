const { RichEmbed } = require("discord.js");
const { getMember, formatDate } = require("../../functions.js");
const { stripIndents } = require("common-tags");
const { version } = require("../../config.json");


module.exports = {
    name: "about",
    category: "info",
    description: "Gives information about the bot and the server",
    

    run: async (client, message, args) => {

        if (message.deletable) message.delete();
        
        const embed = new RichEmbed()
            .setColor("RANDOM")
            .setTimestamp()
            .setThumbnail(client.user.displayAvatarURL)
            .addField('Bot information', stripIndents`**> Bot name** ${client.displayName}
            **> Version:** ${version}`, true)
            .addField('Server information', stripIndents`**> Server name** ${message.guild.name}
            **> Current Member amount:** ${message.guild.memberCount}`, true)

        
       


        return message.channel.send(embed);
    }
    
}