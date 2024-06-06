const { isEmpty } = require('ramda');
const prisma = require('../db/prisma');
const { redis } = require('../../redis');

const tasks = []

/**
 *  @param {import('../../types/forward').ForwardMeta} payload
 */
const postProcessForward = async (payload) => {
  const { hash, ip, userAgent, fromClientSide, countryCode, updatedAt } = payload;

  if (!hash) return;

  const hashKey = `hShort:${hash}`;
  let history = await redis.hgetall(hashKey);

  if (isEmpty(history)) {
    // cache miss
    history = await prisma.urlShortenerHistory.findUnique({
      where: {
        hash,
      },
    });
  }

  if (!history) {
    return;
  }

  const historyId = Number(history.id);
  const data = {
    ip,
    updatedAt,
    userAgent,
    urlShortenerHistoryId: historyId,
    countryCode,
    fromClientSide,
  }
  tasks.push(data)
};

// Async function to process each task
async function processTask(task) {
  // Perform some asynchronous operation on the task
  await prisma.urlForwardMeta.upsert({
    where: {
      userAgent_ip_urlShortenerHistoryId: {
        ip: task.ip,
        userAgent: task.userAgent,
        urlShortenerHistoryId: task.urlShortenerHistoryId,
      },
    },
    update: {
      updatedAt: task.updatedAt,
      countryCode: task.countryCode,
      fromClientSide: task.fromClientSide,
    },
    create: task,
  });;
  // Do something with the processed task
  console.log(`Processed task: ${JSON.stringify(task)}`);
}

// Function to clear the task queue
function clearTaskQueue() {
  tasks.length = 0;
  console.log('Task queue cleared.');
}

// Loop through the tasks and process each one
async function processTasks() {
  console.log('Task length', tasks.length)
  try {
    for (const task of tasks) {
      await processTask(task);
    }
    clearTaskQueue();
  } catch (error) {
    console.error('Error processing tasks:', error);
  }
}

module.exports = { processTasks, postProcessForward };
