import type { ActionDefinition } from '@segment/actions-core'
import { EventType } from '../common/event'
import {
  event_id,
  timestamp,
  channel_type,
  user_id,
  device,
  session_id,
  default_currency,
  items,
  page_id,
  page_identifier_tokens,
} from '../common/fields'
import { MolocoAPIClient } from '../common/request-client'
import { convertEvent } from '../common/convert'
import type { Settings } from '../generated-types'
import type { Payload } from './generated-types'

const action: ActionDefinition<Settings, Payload> = {
  title: 'Home',
  defaultSubscription: 'type = "page" and properties.name = "Home"',
  description: 'Represents a user visiting a home page',
  fields: {
    event_id,
    timestamp,
    channel_type,
    user_id,
    device,
    session_id,
    default_currency,
    items,
    page_id,
    page_identifier_tokens,
  },
  perform: (request, data) => {
    const client = new MolocoAPIClient(request, data.settings)
    const body = convertEvent({ eventType: EventType.Home, payload: data.payload })
    return client.sendEvent(body)
  }
}

export default action