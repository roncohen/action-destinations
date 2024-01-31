import { createTestEvent } from '@segment/actions-core'
import { Settings } from '../generated-types'
import dayjs from '../../../lib/dayjs'
import { testRunner } from '../test-helper'

describe('CustomerIO', () => {
  describe('createUpdateDevice', () => {
    testRunner((settings: Settings, action: Function) => {
      it('should work with default mappings when userId is supplied', async () => {
        const userId = 'abc123'
        const deviceId = 'device_123'
        const deviceType = 'ios'
        const timestamp = dayjs.utc().toISOString()
        const event = createTestEvent({
          userId,
          timestamp,
          context: {
            device: {
              token: deviceId,
              type: deviceType
            }
          }
        })
        const response = await action('createUpdateDevice', {
          event,
          settings,
          useDefaultMappings: true
        })

        expect(response).toEqual({
          action: 'add_device',
          device: {
            attributes: {},
            token: deviceId,
            platform: deviceType,
            last_used: dayjs.utc(timestamp).unix()
          },
          identifiers: {
            id: userId
          },
          type: 'person'
        })
      })

      it("should not convert last_used if it's invalid", async () => {
        const userId = 'abc123'
        const deviceId = 'device_123'
        const deviceType = 'ios'
        const timestamp = '2018-03-04T12:08:56.235 PDT'
        const event = createTestEvent({
          userId,
          timestamp,
          context: {
            device: {
              token: deviceId,
              type: deviceType
            }
          }
        })
        const response = await action('createUpdateDevice', {
          event,
          settings,
          useDefaultMappings: true
        })

        expect(response).toEqual({
          action: 'add_device',
          device: {
            attributes: {},
            token: deviceId,
            platform: deviceType,
            last_used: timestamp
          },
          identifiers: {
            id: userId
          },
          type: 'person'
        })
      })

      it('should not convert last_used to a unix timestamp when convert_timestamp is false', async () => {
        const userId = 'abc123'
        const deviceId = 'device_123'
        const deviceType = 'ios'
        const timestamp = dayjs.utc().toISOString()
        const event = createTestEvent({
          userId,
          timestamp,
          context: {
            device: {
              token: deviceId,
              type: deviceType
            }
          }
        })
        const response = await action('createUpdateDevice', {
          event,
          settings,
          mapping: {
            convert_timestamp: false
          },
          useDefaultMappings: true
        })

        expect(response).toEqual({
          action: 'add_device',
          device: {
            attributes: {},
            token: deviceId,
            platform: deviceType,
            last_used: timestamp
          },
          identifiers: {
            id: userId
          },
          type: 'person'
        })
      })
    })
  })
})
