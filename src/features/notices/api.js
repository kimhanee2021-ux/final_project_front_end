import apiClient from '../../utils/apiClient'
import { createNoticeApi } from './noticeApi'

export const noticeApi = createNoticeApi(apiClient)
