'use strict';
module.exports = {
  connections: {
    rabbitmq: {
      options: {
        type: 'tcp',
        host: '127.0.0.1',
        pin: ['role:backend']
      }
    }
  },
  paths: {
    public: '../client'
  },
  serverUrl: 'http://localhost:60001',
  port: 60001
};