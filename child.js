import { expose } from 'threads/worker';
import * as npmPlugin from '@semantic-release/npm';

expose({
  verifyConditions: async (...args) => npmPlugin.verifyConditions(...args),
  prepare: async (...args) => npmPlugin.prepare(...args),
  publish: async (...args) => npmPlugin.publish(...args),
  addChannel: async (...args) => npmPlugin.addChannel(...args),
});
