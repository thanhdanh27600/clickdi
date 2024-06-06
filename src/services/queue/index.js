const { queueReceiver } = require("./azure");
const { sendMessageToAzureQueue } = require("./azure/sendMessageToAzureQueue");
const { sendMessageToRabbitQueue, consumerMessagesRabbit } = require("./rabbit");
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

const runQueue = () => {
    if (process.env.queue === 'true') return;
    process.env.queue = 'true';

    console.log('queuePlatform', queuePlatform);
    switch (queuePlatform) {
        case 'AZURE':
            queueReceiver()
            break;
        case 'RABBIT':
        default:
            sendMessageToRabbitQueue({ subject: 'health', body: 'Queue is starting...' });
            consumerMessagesRabbit();
            break;
    }
}

module.exports = { sendMessageToQueue, runQueue };
