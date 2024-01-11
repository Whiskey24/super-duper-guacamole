import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { AppConfig } from './types';

const configPath = path.join(__dirname, '../config.yml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8')) as AppConfig;

console.log('Loaded config');

export default config;