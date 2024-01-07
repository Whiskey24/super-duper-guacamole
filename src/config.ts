import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const configPath = path.join(__dirname, '../config.yml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

export default config;