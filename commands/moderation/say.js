const { RichEmbed } = require("discord.js");

module.exports = {
    name: "say",
    aliases: ["bc", "broadcast"],
    description: "Bot says stuff",
    usage: "[channel], <input>",
    run: async (client, message, args) => {
        message.delete();

        if (!message.member.hasPermission("MANAGE_MESSAGES"))
            return message.reply("You don't have the required permissions to use this command.").then(m => m.delete(5000));

        

        const roleColor = message.guild.me.highestRole.hexColor;

        function checkHash(number) {
            return number != "#";
        }
          
        var b;
        //console.log(args[0])
        var chnl = Array.from(args[0])
        
        if (chnl.includes("#")) {
            b = chnl.slice(2, chnl.indexOf(">"))
            //console.log(1)
            //console.log(b)
            var channel = message.guild.channels.find(channel => channel.id === b.join(""));       
        } else {
            //b = chnl;
            //console.log(2)
            var channel = message.guild.channels.find(channel => channel.name === chnl.join(""));
        }
        //console.log(channel.id)
        
        
        //console.log(channel)
        
        if (!channel) {
            if (typeof args[0] == 'undefined') {
                return message.channel.send("Maybe include a message :wink:")
            }  
        } else {
            if (typeof args[1] == 'undefined') {
                return message.channel.send("Maybe include a message :wink:")
            }
        }

        

        if (!channel) {
            if (args[0].toLowerCase() === "embed") {
            const embed = new RichEmbed()
                .setDescription(args.slice(1).join(" "))
                .setColor(roleColor === "#000000" ? "#ffffff" : roleColor);

                message.channel.send(embed);
             } else {
                message.channel.send(args.slice(0).join(" "));
            }
        } else {
            if (args[1].toLowerCase() === "embed") {
                const embed = new RichEmbed()
                    .setDescription(args.slice(2).join(" "))
                    .setColor(roleColor === "#000000" ? "#ffffff" : roleColor);
    
                    channel.send(embed);
            } else {
                channel.send(args.slice(1).join(" "));
            }
        }
    }
}
