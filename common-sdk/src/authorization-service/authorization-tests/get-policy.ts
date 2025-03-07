import * as fs from 'fs';
import * as path from 'path';

export const getPolicy = () => {
  return fs.readFileSync(path.resolve(__dirname, './cedar/policies.cedar'), 'utf-8');
};

export const getSchema = () => {
  return fs.readFileSync(path.resolve(__dirname, './cedar/schema.cedarschema'), 'utf-8');
};
