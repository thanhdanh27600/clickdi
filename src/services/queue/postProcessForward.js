const { isEmpty } = require('ramda');
const prisma = require('../db/prisma');
const { redis } = require('../../redis');
const { isLocal } = require('./utils');

let tasks = []

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
async function processTask(cachedData) {
  const task = JSON.parse(cachedData);

  await prisma.urlForwardMeta.upsert({
    where: {
      userAgent_ip_urlShortenerHistoryId: {
        ip: task.ip,
        userAgent: task.userAgent,
        urlShortenerHistoryId: Number(task.urlShortenerHistoryId),
      },
    },
    update: {
      updatedAt: task.updatedAt,
      countryCode: task.countryCode,
      fromClientSide: task.fromClientSide,
    },
    create: {
      ip: task.ip,
      userAgent: task.userAgent,
      fromClientSide: task.fromClientSide,
      countryCode: task.countryCode,
      updatedAt: task.updatedAt,
      urlShortenerHistoryId: Number(task.urlShortenerHistoryId),
    },
  });
  // Do something with the processed task
  if (isLocal) console.log(`Processed task: ${JSON.stringify(task)}`);
}

// Function to clear the task queue
function clearTaskQueue() {
  tasks.length = 0;
  // console.log('Task queue cleared.');
}

// Loop through the tasks and process each one
async function processTasks() {
  try {
    const key = `lForward`;
    const listForward = await redis.lrange(key, 0, -1);

    if (isLocal) console.log('listForward', listForward);
    tasks = tasks.concat(listForward);
    if (isLocal) console.log('tasks', tasks);

    // Delete the list
    await redis.del(key);

  } catch (error) {
    console.error('Error processing cached tasks:', error);
    console.log('Current tasks', tasks);
  }

  try {
    for (const task of tasks) {
      await processTask(task);
    }
    clearTaskQueue();
  } catch (error) {
    console.error('Error processing tasks:', error);
    console.log('Current tasks', tasks);
  }
}

module.exports = { processTasks, postProcessForward };
