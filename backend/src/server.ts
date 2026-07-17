import http from 'http'
import app, { init } from './app'
import config from './config'

async function start() {
  await init()

  const httpServer = http.createServer(app)
  httpServer.listen(config.app.port, () => {
    console.log(`${config.app.name} started on port ${config.app.port}`)
  })
}

start().catch(error => {
  console.error(error)
  process.exit(1)
})
