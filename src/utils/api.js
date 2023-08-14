import { setInfo } from './storage.js'
const API_TIMER = 1000

export async function addOne (payload) {
  try {
    await new Promise(resolve => setTimeout(resolve, API_TIMER))
    if (payload.qty % 2 !== 0) throw new Error('Ошибка сохранения данных')
    setInfo(payload)

    return { success: true }
  } catch (error) {
    console.error(error.message)
    return { success: false }
  }
}
