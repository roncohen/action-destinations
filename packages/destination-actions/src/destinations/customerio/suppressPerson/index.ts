import type { ActionDefinition } from '@segment/actions-core'
import type { Settings } from '../generated-types'
import type { Payload } from './generated-types'
import { sendBatch, sendSingle } from '../utils'

const action: ActionDefinition<Settings, Payload> = {
  title: 'Suppress Person',
  description: `Suppress a person in Customer.io. This will prevent the person from receiving any messages.`,
  defaultSubscription: 'event = "User Suppressed"',
  fields: {
    person_id: {
      label: 'Person ID',
      description:
        'The ID used to uniquely identify a person in Customer.io. Any valid identifier is supported, such as ID, cio_id, email, etc. Anonymous users cannot be suppressed. [Learn more](https://customer.io/docs/identifying-people/#identifiers).',
      type: 'string',
      default: {
        '@if': {
          exists: { '@path': '$.userId' },
          then: { '@path': '$.userId' },
          else: { '@path': '$.traits.email' }
        }
      },
      required: true
    }
  },

  performBatch: (request, { payload: payloads, settings }) => {
    return sendBatch(
      request,
      payloads.map((payload) => ({
        action: 'suppress',
        payload,
        settings,
        type: 'person'
      }))
    )
  },

  perform: (request, { payload, settings }) => {
    return sendSingle(request, {
      action: 'suppress',
      payload,
      settings,
      type: 'person'
    })
  }
}

export default action
