import config from '../../config'
import { EmailEventType, renderEmail, type EmailLanguage, type EmailTemplateData } from './templates'

export type EmailMessage = { to: string; subject: string; text: string; from?: string }
export interface EmailProvider { send(message: EmailMessage): Promise<void> }
class ConsoleEmailProvider implements EmailProvider { async send(message: EmailMessage) { console.info(`[email:console] to=${message.to} subject=${message.subject}`) } }
class DisabledEmailProvider implements EmailProvider { async send(message: EmailMessage) { console.info(`[email:skipped] disabled or provider not configured; to=${message.to} subject=${message.subject}`) } }

function provider(): EmailProvider { return config.email.enabled && config.email.provider === 'console' ? new ConsoleEmailProvider() : new DisabledEmailProvider() }
export async function sendEvent(to: string, event: EmailEventType, language: EmailLanguage, data: EmailTemplateData) {
  const rendered = renderEmail(event, language, data)
  try { await provider().send({ to, from: config.email.from, ...rendered }) } catch (error) { console.error(`[email:failed] event=${event} to=${to}`, error) }
}
export { EmailEventType }
