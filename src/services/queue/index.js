const { sendMessageToAzureQueue } = require("./azure/sendMessageToAzureQueue");
const { sendMessageToRabbitQueue } = require("./rabbit");
const { queuePlatform } = require("./utils");

const sendMessageToQueue = async (message) => {
    switch (queuePlatform) {
        case 'AZURE':
            await sendMessageToAzureQueue([message])
            break;
        case 'RABBIT':
        default:
            await sendMessageToRabbitQueue(message);
            break;
    }
}

module.exports = { sendMessageToQueue };
