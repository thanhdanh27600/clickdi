const { ServiceBusClient } = require('@azure/service-bus');
const { connectionString, queueName, isTest, isLocal, logger } = require('../utils');

/**
 * An array of objects representing message types.
 * @typedef {Object} MessageType
 * @property {string} subject - The subject of the message.
 * @property {*} body - The body of the message, which can be of any type.
 */

/**
 * Represents an array of message types.
 * @typedef {MessageType[]} MessageTypesArray
 */

/**
 * Function that asynchronously processes an array of message types.
 * @param {MessageTypesArray} messages - An array of message types.
 * @returns {Promise<void>} A Promise that resolves when the processing is complete.
 */
async function sendMessageToAzureQueue(messages) {
  if (isTest) return;
  try {
    // create a Service Bus client using the connection string to the Service Bus namespace
    const sbClient = new ServiceBusClient(connectionString);

    // createSender() can also be used to create a sender for a topic.
    const sender = sbClient.createSender(queueName);

    // Tries to send all messages in a single batch.
    // Will fail if the messages cannot fit in a batch.
    // await sender.sendMessages(messages);

    // create a batch object
    let batch = await sender.createMessageBatch();
    for (let i = 0; i < messages.length; i++) {
      // for each message in the array

      // try to add the message to the batch
      if (!batch.tryAddMessage(messages[i])) {
        // if it fails to add the message to the current batch
        // send the current batch as it is full
        await sender.sendMessages(batch);

        // then, create a new batch
        batch = await sender.createMessageBatch();

        // now, add the message failed to be added to the previous batch to this batch
        if (!batch.tryAddMessage(messages[i])) {
          // if it still can't be added to the batch, the message is probably too big to fit in a batch
          throw new Error('Message too big to fit in a batch');
        }
      }
    }

    // Send the last created batch of messages to the queue
    if (isLocal) console.log(`Sending a batch of messages ${JSON.stringify(messages)} to the queue: ${queueName}`);
    await sender.sendMessages(batch);

    // Close the sender
    await sender.close();
  } catch (e) {
    logger.error(e);
    await sbClient.close();
    throw e;
  }
}

module.exports = { sendMessageToAzureQueue };
