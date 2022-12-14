const moment = require("moment");
moment.locale("tr");
const forceBans = require("../../schemas/forceBans");
const conf = require("../../configs/sunucuayar.json")
const settings = require("../../configs/settings.json")
const { red, green } = require("../../configs/emojis.json")
module.exports = {
  conf: {
    aliases: ["forceban"],
    name: "forceban",
    help: "forceban"
  },

  run: async (client, message, args, embed) => {
    if (message.guild.owner.id !== message.author.id && !settings.owners.includes(message.author.id)) return message.react(red)
    if (!args[0]) { 
    message.react(red)  
    message.channel.send("Bir üye belirtmelisin!").then(x=>x.delete({timeout:5000})) 
    return }
    const user = message.mentions.users.first() || await client.fetchUser(args[0]);
    if (!user) {
    message.react(red)    
    message.channel.send("Böyle bir kullanıcı bulunamadı!").then(x=>x.delete({timeout:5000})) 
    return }
    const ban = await forceBans.findOne({ guildID: message.guild.id, userID: user.id });
    if (ban) {
    message.react(red)
    message.channel.send("Bu üye zaten banlı!").then(x=>x.delete({timeout:5000})) 
    return }
    const reason = args.slice(1).join(" ") || "Belirtilmedi!";
    const member = message.guild.members.cache.get(user.id);
    if (message.member.roles.highest.position <= member.roles.highest.position) return message.channel.send("Kendinle aynı yetkide ya da daha yetkili olan birini banlayamazsın!").then(x=>x.delete({timeout:5000}))
    if (member && !member.bannable) {
    message.react(red)
    message.channel.send("Bu üyeyi banlayamıyorum!").then(x=>x.delete({timeout:5000})) }
    message.guild.members.ban(user.id, { reason }).catch(() => {});
    await new forceBans({ guildID: message.guild.id, userID: user.id, staff: message.author.id }).save();
    const penal = await client.penalize(message.guild.id, user.id, "FORCE-BAN", true, message.author.id, reason);
    const gifs = ["https://media1.tenor.com/images/ed33599ac8db8867ee23bae29b20b0ec/tenor.gif?itemid=14760307", "https://media.giphy.com/media/fe4dDMD2cAU5RfEaCU/giphy.gif", "https://media1.tenor.com/images/4732faf454006e370fa9ec6e53dbf040/tenor.gif?itemid=14678194"];
    message.lineReply(`${Cezaa} ${member ? member.toString() : user.username} üyesi, ${message.author} tarafından, \`${reason}\` nedeniyle **kalıcı olarak** banlandı! `).then(x=>x.delete({timeout:50000}))
    message.react(green)
    if (settings.dmMessages) user.send(` **${message.guild.name}** sunucusundan, **${message.author.tag}** tarafından, **${reason}** sebebiyle **kalıcı olarak** banlandınız!`).catch(() => {});

    const log = embed
      .setAuthor(user.username, user.avatarURL({ dynamic: true, size: 2048 }))
      .setColor("#2f3136")
      .setDescription(`
${member ? member.toString() : user.username} üyesi **kalıcı olarak** banlandı!

\`●❯\` Ceza ID: \`#${penal.id}\`
\`●❯\` Banlanan Üye: ${member ? member.toString() : ""} \`(${user.username.replace(/\`/g, "")} - ${user.id})\`
\`●❯\` Banlayan Yetkili: ${message.author} \`(${message.author.username.replace(/\`/g, "")} - ${message.author.id})\`
\`●❯\` Ban Tarihi: \`${moment(Date.now()).format("LLL")}\`
\`●❯\` Ban Sebebi: \`${reason}\`
      `)
      .setImage(gifs.random())
    message.guild.channels.cache.get(conf.banLogChannel).wsend(log);

    if (settings.banlimit > 0) {
      if (!banLimit.has(message.author.id)) banLimit.set(message.author.id, 1);
      else banLimit.set(message.author.id, banLimit.get(message.author.id) + 1);
      setTimeout(() => {
        if (banLimit.has(message.author.id)) banLimit.delete(message.author.id);
      }, 1000 * 60 * 60);
    }
  },
};


