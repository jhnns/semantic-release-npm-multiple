import * as self from './index.js';

export default {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [self, { registries: { github: {}, public: {} } }],
    '@semantic-release/github',
  ],
};
