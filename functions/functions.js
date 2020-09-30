const fetch = require('node-fetch');
const fs = require('fs');
const Discord = require('discord.js');
const { error_handler, sign_token } = require('./default_functions');
const { owner } = require('../src/config.json');
const client = require('../src/client');

module.exports = {
    getMember: function(message, toFind = '') {
        toFind = toFind.toLowerCase();

        let target = message.guild.roles.cache.find(toFind);
        
        if (!target && message.mentions.members)
            target = message.mentions.members.first();

        if (!target && toFind) {
            target = message.guild.members.cache.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                member.user.tag.toLowerCase().includes(toFind)
            });
        }
            
        if (!target) 
            target = message.member;
            
        return target;
    },

    formatDate: function(date) {
        return new Intl.DateTimeFormat('en-US').format(date)
    },

    promptMessage: async function (message, author, time, validReactions, member) {
        
        time *= 1000;
 
        for (const reaction of validReactions) await message.react(reaction);

        const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === author.id;

        return message
            .awaitReactions(filter, { max: 1, time: time})
            .then(collected => collected.first() && collected.first().emoji.name);
    },

    filter_integer: function (message, mention) {
        return new Promise(function (resolve, reject) {
            var person = Array.from(mention)
            if (person.includes("@") || person.includes("#")) {                
                var mbr = []
                person.forEach(function(letter) {
                    if (Number.isInteger(+letter)) {
                        mbr.push(letter)
                    }                    
                })
                return resolve(mbr.join(""))
            } else {
                var mbr2 = message.guild.roles.cache.find(r => r.name === person.join(""));
                if (!mbr2) {
                    mbr2 = message.guild.channels.cache.find(r => r.name === person.join(""));
                }
                return resolve(mbr2.id);
            }
        })
    },

    pageparser: function (message, msg, i, time, chooseArr, promptMessage, array_length) {
        
        return new Promise(async function (resolve, reject) {
            const chooseArrfirst = [chooseArr[1], chooseArr[2]]
            const chooseArrlast = [chooseArr[0], chooseArr[1]]
            if (i === 0) {
                var reaction = await promptMessage(msg, message.author, time, chooseArrfirst);

                if (reaction === chooseArr[2]) {
                    msg.delete();  
                    i++;                    
                    return resolve(i);
                } else if (reaction === chooseArr[1]) {
                    i = array_length + 1;
                    msg.delete();
                    return;
                }
            } else if (i === array_length - 1) {
                var reaction = await promptMessage(msg, message.author, time, chooseArrlast);

                if (reaction === chooseArr[0]) {
                    msg.delete();
                    i--;                    
                    return resolve(i);                  
                } else if (reaction === chooseArr[1]) {
                    i = array_length + 1;
                    msg.delete();
                    return;
                }
            } else {
                var reaction = await promptMessage(msg, message.author, time, chooseArr);

                if (reaction === chooseArr[0]) {
                    msg.delete();
                    i--;                    
                    return resolve(i);                    
                } else if (reaction === chooseArr[2]) {
                    msg.delete();
                    i++;                    
                    return resolve(i);
                } else if (reaction === chooseArr[1]) {
                    i = array_length + 1;
                    msg.delete();
                    return;
                }
            }
        })
    },

    password_generator: function(len) {
        var length = (len) ? (len) : (10);
        var string = "abcdefghijklmnopqrstuvwxyz"; //to upper 
        var numeric = '0123456789';
        var punctuation = '!@#$%^&*()_+~`|}{[]\:;?><,./-=';
        var password = "";
        var character = "";
        var crunch = true;
        while (password.length < length) {
            entity1 = Math.ceil(string.length * Math.random() * Math.random());
            entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
            entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
            hold = string.charAt(entity1);
            hold = (password.length % 2 == 0) ? (hold.toUpperCase()) : (hold);
            character += hold;
            character += numeric.charAt(entity2);
            character += punctuation.charAt(entity3);
            password = character;
        }
        password = password.split('').sort(function () { return 0.5 - Math.random() }).join('');
        return password.substr(0, len);
    },

    get_API_call: function (message, api_section = '', type = '', payload, extra_payload) {
        return new Promise(async function (resolve, reject) {            
            const token = sign_token(message.guild.id);
            //console.log(token)
            const response = await fetch(process.env.API_ADDRESS + `/discord/${api_section}/?guildID=${message.guild.id}&payload=${payload}&extraPayload=${extra_payload}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'auth-token': token,
                    'type': type,
                }                
            }).then(function (response) {
                return response.json();
            }).catch(error => {
                return error_handler(error);
            })
            
            if (typeof response == 'undefined') {
                return resolve(false);
            } else if (typeof response.status == 'undefined') {
                return resolve(response);
            } else if (response.status === 200 && response.success === false) {
                return response.err
            } else {
                message.reply(`An error has occured: ${response.err}`);
            }
            
            
        })
    },

    post_API_call: function (api_section = '', payload, guild, type = '') {
        return new Promise(function (resolve, reject) {
            const token = sign_token(guild.id);
            //console.log(token)
            const response = fetch(process.env.API_ADDRESS + `/discord/${api_section}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'content-type': 'application/json',
                    'auth-token': token,
                    'type': type,
                },
                body: payload
            }).then(function (response) {
                if (response.status === 200) {
                    return response.json();
                } else if (response.status === 409) {
                    return response.json();
                }
            }).catch(error => {
                return error_handler(error);
            })

            return resolve(response);
        })
    },

    delete_API_call: function (api_section = '', payload, guild, type = '') {
        return new Promise(function (resolve, reject) {
            const token = sign_token(guild.id);
            //console.log(token)
            const response = fetch(process.env.API_ADDRESS + `/discord/${api_section}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'content-type': 'application/json',
                    'auth-token': token,
                    'type': type,
                },
                body: payload
            }).then(function (response) {
                if (response.status === 200) {
                    return response.json();
                } else if (response.status === 409) {
                    return response.json();
                }
            }).catch(error => {
                return error_handler(error);
            })

            return resolve(response);
        })
    },

    update_API_call: function (api_section = '', payload, guild, type = '') {
        return new Promise(function (resolve, reject) {
            const token = sign_token(guild.id);
            //console.log(token)
            const response = fetch(process.env.API_ADDRESS + `/discord/${api_section}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'content-type': 'application/json',
                    'auth-token': token,
                    'type': type,
                },
                body: payload
            }).then(function (response) {
                if (response.status === 200) {
                    return response.json();
                } else if (response.status === 409) {
                    return response.json();
                }
            }).catch(error => {
                return error_handler(error);
            })

            return resolve(response);
        })
    },

    checkStatus: async function (message, get_API_call) {
        let a = 0;
        const cmd = [];
        const embed = new Discord.MessageEmbed();

        fs.readdirSync("./commands/").forEach(dir => {
            // Filter for .js command files
            const commands = fs.readdirSync(`./commands/${dir}/`).filter(file => file.endsWith(".js"));


            // Loop over the commands, and add all of them to a collection
            // If there's no name found, prevent it from returning an error        
            for (let file of commands) {
                let pull = require(`../commands/${dir}/${file}`);

                if (pull.name && pull.category && pull.description && pull.permission) {
                    continue;
                } else {
                    cmd.push(pull.name || pull.category || pull.description || pull.permission)
                    a++;
                    continue;
                }


            }
        });

        const success = await get_API_call(message, 'check', 'checkIn');

        if (a === 0 && success.success === true) {
            return message.reply(embed.setColor('GREEN').setDescription("**Bot is operational**"));
        } else if (a > 0 && success.success === true) {
            embed.setColor('YELLOW')
                .setDescription("**Performance is degraded. The following commands do not work!**")
                .addField(`\u200b`, `\`${cmd.join('\n- ')}\``);
            
            client.users.fetch(owner, false).then(user => {
                user.send(embed);
            });
            return message.reply(embed);
        } else {
            return message.reply(embed.setColor('RED').setDescription("**Bot is NOT operational!**"));
        }
    }
        
};