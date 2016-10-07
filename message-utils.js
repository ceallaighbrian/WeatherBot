function getMessages(json) {
    
    console.log("in message");
    if(json && json.message && json.message.attachments && json.message.attachments.length > 0)
        return parseLocation(json);
    else if (json && json.message && json.message.text)
        console.log("returning test message");
        return parseMessage(json);
    return [];

};


function parseLocation(json) {
    let attachment = json.message.attachments[0];
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


