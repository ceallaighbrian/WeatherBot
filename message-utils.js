function getMessages(json) {

    if(json && json.message && json.message.attachments && json.message.attachments.length > 0)
        return parseLocation(json);
    else if (json && json.message && json.message.text)
        return parseMessage(json);
    return [];

};


function parseLocation(json) {
    var attachment = json.message.attachments[0];
    if (attachment.payload && attachment.payload.coordinates)
        return [
            {
                type: 'location',
                senderId: json.sender.id,
                coordinates: attachment.payload.coordinates
            }
        ];
    else 
        return [];
};


function parseMessage(json) {
    return [
        {
            type: 'text',
        senderId: json.sender.id,
        coordinates: json.message.text
        }
    ]
};

module.exports = {
    getMessages
};


