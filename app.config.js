// app.config.js — read secrets from .env (gitignored) and expose via expo-constants
// Access in code: import Constants from 'expo-constants'; Constants.expoConfig.extra.replicateApiToken
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra ?? {}),
    replicateApiToken: REPLICATE_API_TOKEN ?? '',
  },
});
