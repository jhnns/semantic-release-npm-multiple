import { spawn, Worker } from 'threads';

// The @semantic-release/npm plugin maintains
// some state at the module level to decide where to
// store its .npmrc file.
// Because of this, we have to monkey around a bit with
// Node's require cache in order to create multiple copies
// of the module in order to use it with different configurations.
const registryPlugins = new Map();
async function getChildPlugin(registryName) {
  let plugin = registryPlugins.get(registryName);
  if (!plugin) {
    plugin = await spawn(new Worker('./child.js'));
    registryPlugins.set(registryName, plugin);
  }

  return plugin;
}

function createCallbackWrapper(callbackName) {
  return async ({ registries = {}, ...pluginConfig }, context) => {
    for (const [registryName, childConfig] of Object.entries(registries)) {
      const childPlugin = await getChildPlugin(registryName);
      const callback = childPlugin[callbackName];

      context.logger.log(
        `Performing ${callbackName} for registry ${registryName}`,
      );

      const environmentVariablePrefix = `${registryName.toUpperCase()}_`;
      const { env } = context;
      const childEnv = { ...env };

      for (const variableName of [
        'NPM_TOKEN',
        'NPM_USERNAME',
        'NPM_PASSWORD',
        'NPM_EMAIL',
        'NPM_CONFIG_REGISTRY',
        'NPM_CONFIG_USERCONFIG',
      ]) {
        const overridenValue = env[environmentVariablePrefix + variableName];
        if (overridenValue) {
          childEnv[variableName] = overridenValue;
        }
      }

      await callback(
        { ...childConfig, ...pluginConfig },
        { ...context, env: childEnv },
      );
    }
  };
}

export const verifyConditions = createCallbackWrapper('verifyConditions');
export const prepare = createCallbackWrapper('prepare');
export const publish = createCallbackWrapper('publish');
export const addChannel = createCallbackWrapper('addChannel');
