export default {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name            : 'alice',
      script          : './index.js',
      args            : '1234567890',
      node_args       : '--inspect=7077',
      watch           : true,
      ignore_watch    : ["node_modules", "storage", ".ipfs", ".git"],
      env             : {
        PORT : 7777,
      }
    },
    {
      name            : 'bob',
      script          : './index.js',
      args            : '9876543210',
      watch           : true,
      node_args       : '--inspect=8088',
      ignore_watch    : ["node_modules", "storage", ".ipfs", ".git"],
      env             : {
        PORT : 8888,
      }
    },
    {
      name            : 'api',
      script          : './index.js',
      args            : '9118705277939374',
      node_args       : '--inspect=1037',
      env             : {
        ENABLE_WEBSOCKET: 1,
        WS_PORT: 7333,
        PORT : 1337,
      }
    },
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
};
