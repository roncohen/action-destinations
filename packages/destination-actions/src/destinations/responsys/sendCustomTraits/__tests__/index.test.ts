import nock from 'nock'
import { createTestEvent, createTestIntegration } from '@segment/actions-core'
import Destination from '../../index'
import { Settings } from '../../generated-types'

const testDestination = createTestIntegration(Destination)
const actionSlug = 'sendCustomTraits'
const testSettings: Settings = {
  profileListName: 'ABCD',
  profileExtensionTable: 'EFGH',
  username: 'abcd',
  userPassword: 'abcd',
  baseUrl: 'https://njp1q7u-api.responsys.ocs.oraclecloud.com',
  insertOnNoMatch: false,
  matchColumnName1: 'EMAIL_ADDRESS_',
  updateOnMatch: 'REPLACE_ALL',
  defaultPermissionStatus: 'OPTOUT'
}

describe('Responsys.sendCustomTraits', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV } // Make a copy
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })
  it('should send traits data to Responsys with default mapping', async () => {
    nock('https://njp1q7u-api.responsys.ocs.oraclecloud.com')
      .post(
        `/rest/asyncApi/v1.3/lists/${testSettings.profileListName}/listExtensions/${testSettings.profileExtensionTable}/members`
      )
      .reply(202)
    const event = createTestEvent({
      timestamp: '2024-02-09T20:01:47.853Z',
      traits: {
        test_key: false,
        email: 'martin@martechawesome.biz'
      },
      type: 'identify',
      userId: '6789013'
    })

    const responses = await testDestination.testAction(actionSlug, {
      event,
      settings: testSettings,
      useDefaultMappings: true
    })

    expect(responses.length).toBe(1)
    expect(responses[0].status).toBe(202)
    expect(JSON.parse(responses[0]?.options?.body as string)).toMatchObject({
      insertOnNoMatch: false,
      matchColumnName1: 'EMAIL_ADDRESS_',
      matchColumnName2: '',
      recordData: {
        fieldNames: ['EMAIL_ADDRESS_', 'CUSTOMER_ID_'],
        mapTemplateName: '',
        records: [['martin@martechawesome.biz', '6789013']]
      },
      updateOnMatch: 'REPLACE_ALL'
    })
  })

  describe('Failure cases', () => {
    it('should throw an error if event does not include email / riid / customer_id', async () => {
      const errorMessage = 'At least one of the following fields is required: Email Address, RIID, or Customer ID'
      nock('https://njp1q7u-api.responsys.ocs.oraclecloud.com')
        .post(
          `/rest/asyncApi/v1.3/lists/${testSettings.profileListName}/listExtensions/${testSettings.profileExtensionTable}/members`
        )
        .replyWithError({
          message: errorMessage,
          statusCode: 400
        })
      const bad_event = createTestEvent({
        timestamp: '2024-02-09T20:01:47.853Z',
        traits: {
          test_key: false
        },
        type: 'identify'
      })
      await expect(
        testDestination.testAction('sendCustomTraits', {
          event: bad_event,
          useDefaultMappings: true,
          settings: testSettings
        })
      ).rejects.toThrow(errorMessage)
    })
  })
})
