import apiClient from '@/shared/lib/apiClient';
import { createAiRequest } from './request';
export const api = createAiRequest(apiClient);
