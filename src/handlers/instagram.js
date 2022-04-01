var axios = require("axios").default;
var count = require("./insta.json");
const { MessageEmbed } = require("discord.js");
const { writeFileSync } = require("fs");

module.exports = async (client) => {
  var options = {
    method: "GET",
    url: client.config.insta.api_url,
    params: {
      user_id: client.config.insta.user_id,
      batch_size: "40",
    },
    headers: {
      "x-rapidapi-host": client.config.insta.api_host,
      "x-rapidapi-key": client.config.insta.api_key,
    },
  };

  client.Logger.info("Requesting Data...", "Instagram");

  axios
    .request(options)
    .then(async (response) => {
      let data = response.data.data?.user?.edge_owner_to_timeline_media;
      if (!data) return client.Logger.error("No Data from API", "Insta");

      if (
        count.count === data.edges.length ||
        !(count.count < data.edges.length)
      )
        return;

      let i = 0;
      while (count.count < data.edges.length) {
        await postPic(data.edges[i].node, client);
        i++;
        count.count++;
      }
      writeFileSync("./src/handlers/insta.json", JSON.stringify(count));
    })
    .catch(client.Logger.error);
};

async function postPic(img, client) {
  let instaEmbed = new MessageEmbed()
    .setAuthor(
      "buildtheearthgermany",
      "https://scontent-frx5-1.cdninstagram.com/v/t51.2885-19/s150x150/120520893_122537236038948_1785402970201563204_n.jpg?_nc_ht=scontent-frx5-1.cdninstagram.com&_nc_cat=100&_nc_ohc=uDzKDf4elKoAX9IrYi8&tn=6vQjPrP1h13dcJUy&edm=AEF8tYYBAAAA&ccb=7-4&oh=8d0c40e4790843b462a539a914a68729&oe=619B4C85&_nc_sid=a9513d",
      `https://www.instagram.com/p/${img.shortcode}/`
    )
    .setDescription(img.edge_media_to_caption.edges[0].node.text)
    .addField("Likes", img.edge_media_preview_like.count.toString())
    .setImage(img.display_url)
    .setColor("#cc0474")
    .setURL(`https://www.instagram.com/p/${img.shortcode}/`);

  let channel =
    client.channels.cache.get(client.config.insta.channel) ||
    (await client.channels
      .fetch(client.config.insta.channel)
      .catch(client.Logger.error));
  if (!channel) return;

  channel
    .send({
      embeds: [instaEmbed],
      content: `<a:btede:853745991525859338> | <:Instagram:792909049162498079> **buildtheearthgermany** posted a new ${
        img.is_video ? "video" : "photo"
      } on instagram: <https://www.instagram.com/p/${img.shortcode}/>`,
    })
    .then(() => {
      client.Logger.info("Sent new post to Discord", "Instagram");
    })
    .catch(client.Logger.error);
}
