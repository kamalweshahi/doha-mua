import config from '../config'
export async function verifyCaptcha(token?: string) { if (!config.captcha.enabled) return true; return Boolean(token?.trim()) }
