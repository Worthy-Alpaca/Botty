const { Client, RichEmbed, Collection } = require("discord.js");
const { prefix, version, status, welcome_channel, DIFF, LIMIT, TIME } = require('./config.json');
const { token, password } = require('../token.json');
const fs = require("fs");
const { stripIndents } = require("common-tags");
const { promptMessage, getChnl, getMsg, getapproved, getapproved2, getMember, getstartcmd } = require("../functions/functions.js");
const { answers, replies, asks, help, positive, sassy, robot } = require("./answers.json");
const usersMap = new Map();
const mysql = require("mysql");


const client = new Client({
    disableEveryone: false
});

client.reply = new Collection();
client.commands = new Collection();
client.aliases = new Collection();
client.categories = fs.readdirSync("./commands/");





["command"].forEach(handler => {
    require(`../handler/${handler}`)(client);
});


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: password,
  database: "servers",
  encoding: "utf8mb4_unicode_ci"
});

con.connect(err => {
  if(err) throw err;
  console.log("connected to database");
  con.query("CREATE TABLE IF NOT EXISTS servers(id VARCHAR(20) NOT NULL UNIQUE, name TEXT NOT NULL, admin TEXT, moderator TEXT, greeting VARCHAR(512) CHARACTER SET utf8 COLLATE utf8_unicode_ci, channel TEXT, approved TEXT, startcmd TEXT) CHARACTER SET utf8 COLLATE utf8_unicode_ci;")
})

client.on("ready", () => {
    var a = 0;
    console.log(`Logged in as ${client.user.username}`);
    
    client.guilds.forEach(guild => {
      
      con.query(`SELECT * FROM servers WHERE id = '${guild.id}'`, (err, rows) => {
        if(err) throw err;
        let sql;
               
        if (!rows.length) {
          console.log(guild.name, "added")
          sql = `INSERT INTO servers (id, name) VALUES ('${guild.id}', '${guild.name}')`
          return con.query(sql);
        }

        if(rows[0].id === guild.id) {
          a++;
          return;
        } else {
          console.log("b")
          sql = `INSERT INTO servers (id, name) VALUES ('${guild.id}', '${guild.name}')`
          con.query(sql);
        }
                
      });
    })

    if(a > 0) console.log("No new servers")

    client.user.setPresence({
        status: "online",
        game: {
            name: `${status}`,
            type: "WATCHING"
        }
    });
});




//welcome message
client.on("guildMemberAdd", async member => {
    var channel;
    var greeting;  
    
    if (member.bot) return; 
    
    //getting welcome channel/message
    chnl = await getChnl(member, con);
    greeting = await getMsg(member, con);
    rl = await getapproved(member, con);

    const role = member.guild.roles.find(r => r.id === rl)
        
    var channel = member.guild.channels.find(channel => channel.id === chnl); 

    if (!role) {
      return message.reply("No role has been defined yet. You can fix that with !setapproved")
    }
    
    if (typeof greeting == 'undefined') {
      greeting = "Welcome to this generic server. The owner has not bothered with a custom welcome message so you get this one. :person_shrugging:"
    } else if (greeting === null) {
      greeting = "Welcome to this generic server. The owner has not bothered with a custom welcome message so you get this one. :person_shrugging:"
    }

    if (typeof channel == 'undefined') {
      channel = member.guild.channels.find(channel => channel.id === member.guild.systemChannelID);
    } else if (channel === null) {
      channel = member.guild.channels.find(channel => channel.id === member.guild.systemChannelID);
    }
    
    const embed = new RichEmbed() 
        .setColor("RANDOM")
        .setTimestamp()
        .setAuthor(`Hooray, ${member.displayName} just joined our merry band of misfits`, member.user.displayAvatarURL)
        .setDescription(stripIndents`${greeting}`);
    
    return channel.send(embed);
        
});



//message handler
client.on("message", async message => {

    

    if (message.author.bot) return;
    
    
    //automated spam detection and mute
    if(usersMap.has(message.author.id)) {
        let mutee = message.member;
        const report = message.guild.channels.find(channel => channel.name === "reports");
        const userData = usersMap.get(message.author.id);
        const { lastMessage, timer } = userData;
        const difference = message.createdTimestamp - lastMessage.createdTimestamp;
        let muterole = message.guild.roles.find(r => r.name === "Muted")

        const embed = new RichEmbed() 
            .setColor("#ff0000")
            .setTimestamp()
            .setFooter(message.guild.name, message.guild.iconURL)
            .setAuthor("Muted member", mutee.user.displayAvatarURL)
            .setDescription(stripIndents`**> Member: ${mutee} (${mutee.id})
            **> Automated Mute
            **> Muted in: ${message.channel}
            **> Reason: SPAM
            MUTE needs to be manually removed`);

        

        if(!muterole) {
            try{
                muterole = await message.guild.createRole({
                    name: "Muted",
                    color: "#514f48",
                    permissions: []
                })
            message.guild.channels.forEach(async (channel, id) => {
                await channel.overwritePermissions(muterole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    SEND_TTS_MESSAGES: false,
                    ATTACH_FILES: false,
                    SPEAK: false
                })
            })
            } catch(e) {
            console.log(e.stack);
            }   
        }
        let msgCount = userData.msgCount;
        
        if(difference > DIFF) {
          clearTimeout(timer);
          console.log('Cleared timeout');
          userData.msgCount = 1;
          userData.lastMessage = message;
          userData.timer = setTimeout(() => {
            usersMap.delete(message.author.id);
            console.log('Removed from RESET.');
          }, TIME);
          usersMap.set(message.author.id, userData);
        }
        else {
          ++msgCount;
          if(parseInt(msgCount) === LIMIT) {
            mutee.addRole(muterole);
            message.channel.send(`${mutee} You have been muted. Please contact a staff member to get that reversed.`);
            report.send(`@here, someone has been auto-muted.`);
            report.send(embed);
            /* setTimeout(() => {
              mutee.removeRole(muterole);
              message.channel.send('You have been unmuted');
            }, TIME); */
          } else {
            userData.msgCount = msgCount;
            usersMap.set(message.author.id, userData);
          }
        }
      }
      else {
        let fn = setTimeout(() => {
          usersMap.delete(message.author.id);          
        }, TIME);
        usersMap.set(message.author.id, {
          msgCount: 1,
          lastMessage: message,
          timer: fn
        });
      }

                  

    if (!message.guild) return;

    //reply function
    if (message.content.endsWith("?") || message.content.endsWith("?!")) {
      if (message.isMemberMentioned(client.user)) {
        if (message.content.toLowerCase().includes("how") && message.content.toLowerCase().includes("are") && message.content.toLowerCase().includes("you")) {
          return message.channel.send(asks[Math.floor(Math.random() * asks.length)] );
        } else if (message.content.toLowerCase().includes("can" && "you" && "help" && "me")) { 
          return message.reply("I might. Why don't you try out !help? :wink:");
        } else if (message.content.toLowerCase().includes("skynet") || message.content.toLowerCase().includes("jugdement day")) {
          return message.channel.send(sassy[Math.floor(Math.random() * sassy.length)] );
        } else if (message.content.toLowerCase().includes("usefull") || message.content.toLowerCase().includes("sleep") || message.content.toLowerCase().includes("well")) {
          return message.channel.send(positive[Math.floor(Math.random() * positive.length)]);
        } else if (message.content.toLowerCase().includes("robot")){
          return message.channel.send(robot[Math.floor(Math.random() * robot.length)]);
        } else {
          return message.channel.send(replies[Math.floor(Math.random() * replies.length)]);  
        } 
      } else if (message.content.toLowerCase().includes(message.content.toLowerCase().includes("can" && "help" && "me"))) {
          return message.channel.send(help[Math.floor(Math.random() * help.length)] );
      }else {
        return message.channel.send(answers[Math.floor(Math.random() * answers.length)]);
      }  
    } 

    const startcommand = await getstartcmd(message, con);

    if (message.content.startsWith(`${startcommand}`)) {
      
      const member = getMember(message);
      guild = member.guild;
      rl = await getapproved2(message, con);

      const role = message.guild.roles.find(r => r.id === rl);
      
      member.addRole(role.id).catch(e => console.log(e.message));
    }

    if (!message.content.startsWith(prefix)) return;

    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command)
        command.run(client, message, args, con);

   
    
})



client.login(token);

