const ovh = require('ovh');

function createOvhInstance(appKey, appSecret, consumerKey) {
  return ovh({
    endpoint: 'ovh-eu',
    appKey,
    appSecret,
    consumerKey
  });
}

module.exports = { createOvhInstance };
