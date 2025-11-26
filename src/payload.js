const {MessageFlags} = require("discord.js");

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
        console.error(`Failed to download attachment ${attachment.url}:`, error);
        return null;
    }
};

const buildCrosspostPayload = async (thread, authorId, sourceMessage) => {
    const authorLabel = authorId ? `<@${authorId}>` : "Jemand";
    const threadUrl = `https://discord.com/channels/${thread.guildId}/${thread.id}`;
    const headerLine = `${authorLabel} hat neuen Progress in ${threadUrl} gepostet:\n# ${thread.name}`;

    const body = sourceMessage?.content?.trim();
    const content = body ? `${headerLine}\n\n${body}` : headerLine;

    const attachments = Array.from(sourceMessage?.attachments?.values?.() || []);
    const files = (await Promise.all(attachments.map((attachment) => downloadAttachment(attachment)))).filter(Boolean);

    const payload = {content, files};
    payload.flags = MessageFlags.SuppressNotifications;
    return payload;
};

const getStarterMessage = async (thread) => {
    try {
        return await thread.fetchStarterMessage();
    } catch (error) {
        if (error?.code !== 10008) {
            console.error(`Failed to fetch starter message for thread ${thread.id}:`, error);
        }
        try {
            const fetched = await thread.messages.fetch({limit: 1});
            return fetched.first() || null;
        } catch (fetchError) {
            console.error(`Fallback fetch failed for thread ${thread.id}:`, fetchError);
            return null;
        }
    }
};

module.exports = {buildCrosspostPayload, getStarterMessage};
