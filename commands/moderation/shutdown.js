module.exports = {
    name: "shutdown",
    category: "moderation",
    permission: ["null"],
    description: "Kills the bot",
    run: async (client, message, args, con) => {
        if (message.author.id !== "595341356432621573")
            return message.reply("You are not powerful enough to command me in such a way!").then(m => m.delete({ timeout: 5000 }));

        return client.destroy();
    }
}