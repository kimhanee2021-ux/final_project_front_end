import { api as request } from '../ai-common/api';
export const api = (path, options) => request('/ai/manager' + path, options);
