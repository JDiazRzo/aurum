import { getAIResponse } from './chat.service.js'
import { successResponse } from '../../utils/response.js'

export const sendMessage = async (req, res, next) => {
  try {
    const { message, history } = req.body
    const reply = await getAIResponse(req.user.id, message, history || [])
    successResponse(res, { reply })
  } catch (err) { next(err) }
}
