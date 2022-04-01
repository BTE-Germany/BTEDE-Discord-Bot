const { Util } = require("discord.js");

module.exports = (client) => {
  client.db = require("quick.db");
  client.request = new (require("rss-parser"))();

  if (client.db.fetch(`postedVideos`) === null)
    client.db.set(`postedVideos`, []);

  client.Logger.info("Started Watching", "YouTube");

  setInterval(() => {
    client.request
      .parseURL(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${client.config.yt.channel_id}`
      )
      .then((data) => {
        if (client.db.fetch(`postedVideos`).includes(data.items[0].link))
          return;
        else {
          client.db.set(`videoData`, data.items[0]);
          client.db.push("postedVideos", data.items[0].link);
          let parsed = client.db.fetch(`videoData`);
          let channel = client.channels.cache.get(client.config.yt.channel);
          if (!channel) return;
          let message = client.config.yt.messageTemplate
            .replace(/{author}/g, parsed.author)
            .replace(/{title}/g, Util.escapeMarkdown(parsed.title))
            .replace(/{url}/g, parsed.link);
          channel.send(message);
        }
      });
  }, client.config.yt.watchInterval);
};
