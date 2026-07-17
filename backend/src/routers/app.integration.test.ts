import request from 'supertest'
import app from '../app'
import sequelize from '../db/sequelize'

afterAll(async () => {
  await sequelize.close()
})

describe('application integration tests', () => {
  it('returns backend health information', async () => {
    const response = await request(app).get('/health')

    expect(response.statusCode).toBe(200)
    expect(response.body.status).toBe('ok')
    expect(response.body.service).toBe('doha-mua-backend')
  })

  it('protects the booking router when authentication is missing', async () => {
    const expectedErrorLog = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const response = await request(app).get('/api/bookings/mine')
    expectedErrorLog.mockRestore()

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({ message: 'Please login first.' })
  })

  it('rejects booking creation before validating or charging an anonymous request', async () => {
    const expectedErrorLog = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const response = await request(app).post('/api/bookings').send({})
    expectedErrorLog.mockRestore()
    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({ message: 'Please login first.' })
  })

  it('protects lesson playback credentials when authentication is missing', async () => {
    const expectedErrorLog = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const response = await request(app).get('/api/courses/1/lessons/1/video')
    expectedErrorLog.mockRestore()

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({ message: 'Please login first.' })
  })

  it('returns a friendly 404 response for an unknown route', async () => {
    const expectedErrorLog = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const response = await request(app).get('/api/unknown-route')
    expectedErrorLog.mockRestore()

    expect(response.statusCode).toBe(404)
    expect(response.body).toHaveProperty('message')
  })
})
