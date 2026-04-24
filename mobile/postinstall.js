const fs = require('fs');
const path = require('path');

const pluginPath = path.join(
  __dirname,
  'node_modules',
  'expo-modules-core',
  'android',
  'ExpoModulesCorePlugin.gradle'
);

if (fs.existsSync(pluginPath)) {
  let content = fs.readFileSync(pluginPath, 'utf8');
  const targetContent = "from components.release";
  const replacementContent = `def releaseComponent = components.findByName("release")
          if (releaseComponent != null) {
            from releaseComponent
          }`;
  const targetContent2 = "from components['release']";

  if (content.includes(targetContent)) {
    content = content.replace(targetContent, replacementContent);
    fs.writeFileSync(pluginPath, content, 'utf8');
    console.log('[postinstall] Patched ExpoModulesCorePlugin.gradle successfully.');
  } else if (content.includes("from releaseComponent")) {
    console.log('[postinstall] ExpoModulesCorePlugin.gradle already patched.');
  } else if (content.includes(targetContent2)) {
    content = content.replace(targetContent2, replacementContent);
    fs.writeFileSync(pluginPath, content, 'utf8');
    console.log('[postinstall] Patched ExpoModulesCorePlugin.gradle successfully.');
  } else {
    console.log('[postinstall] Could not find the target string in ExpoModulesCorePlugin.gradle. It may have already been patched or updated.');
  }
} else {
  console.log('[postinstall] ExpoModulesCorePlugin.gradle not found, skipping patch.');
}
