const amqp = require('amqplib');
const { logger, isTest, isLocal } = require('../utils');
const { postProcessForward } = require('../postProcessForward');


// RabbitMQ connection URL
const amqpUrl = process.env.RABBITMQ_URL;

// Define the name of the queue to send the message to
const queueName = process.env.RABBITMQ_QUEUE_NAME;

/**
 * 
 * @param {Object} message - The message object.
 * @param {string} message.subject - The subject of the message.
 * @param {*} message.body - The body of the message.
 */
async function sendMessageToRabbitQueue(message) {
    try {
        if (isTest) return;
        if (!amqpUrl) throw new Error('Not found AMQP URL!')
        if (!queueName) throw new Error('Queue name not found!')
        // Connect to RabbitMQ
        const connection = await amqp.connect(amqpUrl);
        const channel = await connection.createChannel();

        // Create the queue if it doesn't exist
        await channel.assertQueue(queueName, { durable: false });

        if (isLocal) console.log("Sending...", message);
        // Send the message to the queue
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));

    } catch (error) {
        console.error('Error sendMessageToRabbitQueue:', error);
    }
}

/**
 * 
 * @param {Object} msg - The message object.
 * @param {string} msg.subject - The subject of the message.
 * @param {string} msg.body - The body of the message.
 */
async function messageHandler(msg) {
    try {
        const message = JSON.parse(msg.content.toString());
        switch (message.subject) {
            case 'forward':
                await postProcessForward(message.body);
                break;
            default:
                console.log('Received message:', message);
                break;
        }
    } catch (error) {
        logger.error(error)
        console.error('Error Message Handler:', error);
    }
}

async function consumerMessagesRabbit() {
    try {
        if (!amqpUrl) throw new Error('Not found AMQP URL!')
        if (!queueName) throw new Error('Queue name not found!')

        // Connect to RabbitMQ
        const connection = await amqp.connect(amqpUrl);
        const channel = await connection.createChannel();

        // Create the queue if it doesn't exist
        await channel.assertQueue(queueName, { durable: false });

        console.log('Queue is asserted...');

        // Consume messages from the queue
        channel.consume(
            queueName,
            messageHandler,
            { noAck: true }
        );
    } catch (error) {
        console.error('Error Consumer:', error);
    }
}


module.exports = { sendMessageToRabbitQueue, consumerMessagesRabbit }
