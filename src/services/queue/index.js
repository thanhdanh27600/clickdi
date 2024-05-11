const { postProcessForward } = require('./postProcessForward');
const { ServiceBusClient } = require('@azure/service-bus');
const { connectionString, queueName, logger } = require('./utils');

/**
 * An array of objects representing message types.
 * @typedef {Object} MessageType
 * @property {string} subject - The subject of the message.
 * @property {*} body - The body of the message, which can be of any type.
 */

/**
 * Process a single message.
 *
 * @param {MessageType} message - The message to be processed.
 * @returns {Promise<void>} A Promise that resolves when the processing is complete.
 *
 * @throws {Error} Throws an error if the message processing fails.
 */
async function myMessageHandler(message) {
  try {
    // console.log(`Processing message ${message.subject} with content: ${JSON.stringify(message.body)}`);
    switch (message.subject) {
      case 'forward':
        await postProcessForward(message.body);
        break;
      default:
        break;
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

let sbClient;
let receiver;

async function main() {
  console.log('Starting Queue Receiver');
  // create a Service Bus client using the connection string to the Service Bus namespace
  sbClient = new ServiceBusClient(connectionString);

  // createReceiver() can also be used to create a receiver for a subscription.
  receiver = sbClient.createReceiver(queueName);

  // function to handle any errors
  const myErrorHandler = async (error) => {
    console.log('Error Queue Handler', error);
  };

  // subscribe and specify the message and error handlers
  receiver.subscribe({
    processMessage: myMessageHandler,
    processError: myErrorHandler,
  });
}

const queueReceiver = () => {
  main().catch((err) => {
    console.log('Error Queue Receiver: ', err);
  });
  // .finally(async () => {
  //   await receiver.close();
  //   await sbClient.close();
  // });
};

module.exports = { queueReceiver };
