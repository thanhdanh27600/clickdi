/** @type {import('next').NextConfig} */
const { runQueue } = require('./src/services/queue');
const { i18n } = require('./next-i18next.config');
const { cronJob } = require('./src/services/crons');
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_SERVER } = require('next/constants');
const isProduction = process.env.NEXT_PUBLIC_BUILD_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n,
};


module.exports = async (phase, { defaultConfig }) => {
  console.log('Quickshare is starting...', phase);
  let shouldRunQueue = phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_SERVER;
  // if (!isProduction) shouldRunQueue = false;
  if (process.env.NEXT_PUBLIC_SHORT_DOMAIN === 'true') shouldRunQueue = false;
  if (shouldRunQueue) {
    // runQueue()
  }
  let shouldRunCron = phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_SERVER;
  if (shouldRunCron) {
    cronJob();
  }

  return nextConfig;
};
