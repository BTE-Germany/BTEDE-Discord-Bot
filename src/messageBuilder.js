const {EmbedBuilder} = require("discord.js");
const logger = require("./logger");

const getStarterMessage = async (thread) => {
    try {
        return await thread.fetchStarterMessage();
    } catch (error) {
        if (error?.code !== 10008) {
            logger.error(`Failed to fetch starter message for thread ${thread.id}:`, error);
        }
        try {
            const fetched = await thread.messages.fetch({limit: 1});
            return fetched.first() || null;
        } catch (fetchError) {
            logger.error(`Fallback fetch failed for thread ${thread.id}:`, fetchError);
            return null;
        }
    }
};

const downloadAttachment = async (attachment) => {
    try {
        const response = await fetch(attachment.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        return {
            attachment: Buffer.from(arrayBuffer),
            name: attachment.name || "attachment",
        };
    } catch (error) {
        logger.error(`Failed to download attachment ${attachment.url}:`, error);
        return null;
    }
};

const buildHeaderEmbed = (thread, isReply = true) => {
    const authorLabel = thread.ownerId ? `<@${thread.ownerId}>` : "Jemand";
    const threadUrl = `https://discord.com/channels/${thread.guildId}/${thread.id}`;

    const embed = new EmbedBuilder()
        .setTitle(thread.name)
        .setFooter({text: "Gepostet/Aktualisiert: "})
        .setTimestamp(new Date());

    if (isReply) {
        embed.setDescription(`${authorLabel} hat in ${threadUrl} geantwortet:`).setColor("#ff0000");
    } else {
        embed.setDescription(`${authorLabel} hat neuen Progress in ${threadUrl} gepostet:`).setColor("#00b0f4");
    }

    return embed;
};

const buildContentPayload = async (sourceMessage) => {
    const body = sourceMessage?.content?.trim() || "";
    const attachments = Array.from(sourceMessage?.attachments?.values?.() || []);
    const files = (await Promise.all(attachments.map((attachment) => downloadAttachment(attachment)))).filter(Boolean);

    if (!body && files.length === 0) {
        return null;
    }

    return {content: body, files};
};

module.exports = {buildHeaderEmbed, buildContentPayload, getStarterMessage};
