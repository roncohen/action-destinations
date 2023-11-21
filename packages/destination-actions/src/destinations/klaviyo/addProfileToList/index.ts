import { ActionDefinition, PayloadValidationError } from '@segment/actions-core'
import type { Settings } from '../generated-types'
import { Payload } from './generated-types'
import { createProfile, addProfileToList } from '../functions'
import { email, external_id } from '../properties'

const action: ActionDefinition<Settings, Payload> = {
  title: 'Add To List',
  description: 'Add to list',
  fields: {
    email: { ...email },
    external_id: { ...external_id }
  },
  perform: async (request, { payload }) => {
    const { email, external_id } = payload
    if (!email) {
      throw new PayloadValidationError('Missing Email')
    }
    const profileData = await createProfile(request, email)
    const id = profileData?.data?.id
    return await addProfileToList(request, id, external_id)
  }
}

export default action
