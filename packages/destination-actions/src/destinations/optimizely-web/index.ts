import type { DestinationDefinition } from '@segment/actions-core'
import type { Settings } from './generated-types'

import trackEvent from './trackEvent'

const destination: DestinationDefinition<Settings> = {
  name: 'Optimizely Web',
  slug: 'actions-optimizely-web',
  mode: 'cloud',

  authentication: {
    scheme: 'custom',
    fields: {
      optimizelyApiKey: {
        label: 'Optimizely API Key',
        description: 'Your Optimizely API Key. TODO: Provide link to instructions on how to get this.',
        type: 'password',
        required: true
      },
      optimizelyAccountId: {
        label: 'Optimizely Account ID',
        description: 'Your Optimizely Account ID. TODO: Provide link to instructions on how to get this.',
        type: 'string',
        required: true
      }
    }
    // testAuthentication: (request) => {
    //   // Return a request that tests/validates the user's credentials.
    //   // If you do not have a way to validate the authentication fields safely,
    //   // you can remove the `testAuthentication` function, though discouraged.
    // }
  },
  
  // onDelete: async (request, { settings, payload }) => {
  //   // Return a request that performs a GDPR delete for the provided Segment userId or anonymousId
  //   // provided in the payload. If your destination does not support GDPR deletion you should not
  //   // implement this function and should remove it completely.
  // },

  actions: {
    trackEvent
  }
}

export default destination
