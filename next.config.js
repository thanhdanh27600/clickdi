/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');
const { cronJob } = require('./src/services/crons');
const { queueReceiver } = require('./src/services/queue');
const { sendMessageToRabbitQueue, consumerMessagesRabbit } = require('./src/services/queue/rabbit');
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_SERVER } = require('next/constants');
const isProduction = process.env.NEXT_PUBLIC_BUILD_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n,
};

module.exports = async (phase, { defaultConfig }) => {
  console.log('Quickshare is starting...');
  let shouldRunQueue = phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_SERVER;
  // if (!isProduction) shouldRunQueue = false;
  if (process.env.NEXT_PUBLIC_SHORT_DOMAIN === 'true') shouldRunQueue = false;
  if (shouldRunQueue) {
    // queueReceiver();
    sendMessageToRabbitQueue({ subject: 'health', body: 'Queue is starting...' });
    consumerMessagesRabbit();
  }
  // cronJob();
  return nextConfig;
};
