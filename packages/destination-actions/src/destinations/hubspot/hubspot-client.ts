import { Settings }  from './generated-types'
import { Payload as ContactPayload } from './upsertContact/generated-types'
import { RequestClient, HTTPError } from '@segment/actions-core'
import { flattenObject } from './utils'
import { HUBSPOT_BASE_URL } from './properties'
import { TransactionContext } from '@segment/actions-core/destination-kit'

export interface SingleContactRequestBody {
    company?: string | undefined
    firstname?: string | undefined
    lastname?: string | undefined
    phone?: string | undefined
    address?: string | undefined
    city?: string | undefined
    state?: string | undefined
    country?: string | undefined
    zip?: string | undefined
    email?: string | undefined
    website?: string | undefined
    lifecyclestage?: string | undefined
    [key: string]: string | undefined
}

interface BatchContactCreateRequestBody extends Array<{ properties: SingleContactRequestBody }> {}

interface BatchContactUpdateRequestBody extends Array<{ properties: SingleContactRequestBody, id: string }> {}


class HubspotClient {
    private settings: Settings
    private _request: RequestClient
  
    constructor(settings: Settings, request: RequestClient) {
      this.settings = settings
      this._request = request
    }




    private buildSingleContactRequestBody(payload: ContactPayload): SingleContactRequestBody {
        return {
            company: payload.company,
            firstname: payload.firstname,
            lastname: payload.lastname,
            phone: payload.phone,
            address: payload.address,
            city: payload.city,
            state: payload.state,
            country: payload.country,
            zip: payload.zip,
            [(payload.identifier_type as string) ?? 'email']: payload.email,
            website: payload.website,
            lifecyclestage: payload.lifecyclestage?.toLowerCase(),
            ...flattenObject(payload.properties)
          } as SingleContactRequestBody
    }

    private async updateSingleContact(properties: SingleContactRequestBody, identifierValue: string, identifier_type: string) {
        return await this._request<SingleContactSuccessResponse>(
          `${HUBSPOT_BASE_URL}/crm/v3/objects/contacts/${identifierValue}?idProperty=${identifier_type}`,
          {
            method: 'PATCH',
            json: {
              properties: properties
            }
          }
        )
    }

    private async createSingleContact(properties: SingleContactRequestBody) {
        return await this._request<SingleContactSuccessResponse>(
            `${HUBSPOT_BASE_URL}/crm/v3/objects/contacts`, {
            method: 'POST',
            json: {
                properties
            }
        })
    }

    async createOrUpdateSingleContact(payload: ContactPayload, transactionContext: TransactionContext | undefined) { 
        const singleContactRequestBody = this.buildSingleContactRequestBody(payload)
        // An attempt is made to update contact with given properties. If HubSpot returns 404 indicating
        // the contact is not found, an attempt will be made to create contact with the given properties
        try {
            const { email: identifierValue, identifier_type = 'email' } = payload
            const response = await this.updateSingleContact(singleContactRequestBody, identifierValue, identifier_type)
    
            // cache contact_id for it to be available for company action
            transactionContext?.setTransaction('contact_id', response.data.id)
    
            // HubSpot returns the updated lifecylestage(LCS) as part of the response.
            // If the stage we are trying to set is backward than the current stage, it retains the current stage
            // and updates the timestamp. For determining if reset is required or not, we can compare
            // the stage returned in response with the desired stage . If they are not the same, reset
            // and update. More details - https://knowledge.hubspot.com/contacts/use-lifecycle-stages
            if (payload.lifecyclestage) {
                const currentLCS = response.data.properties['lifecyclestage']
                const hasLCSChanged = currentLCS === payload.lifecyclestage.toLowerCase()
                if (hasLCSChanged) return response
                // reset lifecycle stage
                await this.updateSingleContact({ ...singleContactRequestBody, lifecyclestage: ''}, identifierValue, identifier_type)
                // update contact again with new lifecycle stage
                return this.updateSingleContact(singleContactRequestBody, identifierValue, identifier_type)
            }
            return response
        } catch (ex) {
            if ((ex as HTTPError)?.response?.status == 404) {
            const result = await this.createSingleContact(singleContactRequestBody)
            // cache contact_id for it to be available for company action
            transactionContext?.setTransaction('contact_id', result.data.id)
            return result
            }
            throw ex
        }
    }
}
  
export default HubspotClient
  