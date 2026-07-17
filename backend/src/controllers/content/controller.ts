import type { NextFunction, Request, Response } from 'express'
import { getWebsiteContent } from '../../services/website-content'

export async function readWebsiteContent(request: Request, response: Response, next: NextFunction) {
  try { response.json(await getWebsiteContent()) } catch (error) { next(error) }
}

export async function updateWebsiteContent(request: Request, response: Response, next: NextFunction) {
  try { const content = await getWebsiteContent(); await content.update(request.body); await content.reload(); response.json(content) } catch (error) { next(error) }
}
