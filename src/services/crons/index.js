const cron = require('node-cron');
const { processTasks } = require('../queue/postProcessForward');

function cronJob() {
  if (process.env.cronJon === 'true') return;
  process.env.cronJon = 'true';

  console.log('Job started at: ' + new Date());

  // Schedule the job to run every 1 minutes
  cron.schedule('*/1 * * * *', () => {
    jobEvery1Minutes();
  });
  // // Schedule the job to run every 5 minutes
  // cron.schedule('*/5 * * * *', () => {
  //   jobEvery5Minutes();
  // });
}

function jobEvery1Minutes() {
  console.log(`jobEvery1Minutes - ${new Date()}`);
  processTasks()
}

function jobEvery5Minutes() {
  console.log(`jobEvery5Minutes - ${new Date()}`);
}

module.exports = { cronJob };
