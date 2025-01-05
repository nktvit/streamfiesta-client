// src/assets/scripts/setEnv.ts
const { writeFile, existsSync, mkdirSync } = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const environment = process.env["NODE_ENV"] || 'development';
const isProduction = environment === 'production';

function writeFileUsingFS(targetPath: string, environmentFileContent: string) {
  writeFile(targetPath, environmentFileContent, function (err: any) {
    if (err) {
      console.log(err);
    } else {
      console.log(`Wrote variables to ${targetPath}`);
    }
  });
}

const envDirectory = './src/environments';

if (!existsSync(envDirectory)) {
  mkdirSync(envDirectory);
}

const targetPath = isProduction
  ? './src/environments/environment.prod.ts'
  : './src/environments/environment.ts';

function generateEnvironmentInterface() {
  const typeDefinitions = Object.keys(process.env)
    .filter(key => !key.startsWith('_'))
    .map(key => `  ${key}: string;`)
    .join('\n');

  return `export interface Environment {
  production: boolean;
${typeDefinitions}
}`;
}

function generateEnvironmentContent() {
  const envVars = Object.keys(process.env)
    .filter(key => !key.startsWith('_'))
    .reduce((acc, key) => {
      let value = process.env[key];
      return `${acc}    ${key}: '${value}',\n`;
    }, '');

  const interfaceContent = generateEnvironmentInterface();

  return `${interfaceContent}

export const environment: Environment = {
    production: ${isProduction},
${envVars}};
`;
}

const environmentFileContent = generateEnvironmentContent();
writeFileUsingFS(targetPath, environmentFileContent);

console.log('Detected environment variables:');
Object.keys(process.env)
  .filter(key => !key.startsWith('_'))
  .forEach(key => console.log(`- ${key}`));
