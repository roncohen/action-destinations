import { HTTPError } from '@segment/actions-core'
import { ActionDefinition, RequestClient, IntegrationError } from '@segment/actions-core'
import type { Settings } from '../generated-types'
import type { Payload } from './generated-types'
import { HUBSPOT_BASE_URL } from '../properties'
import { flattenObject } from '../utils'
import split from 'lodash/split'
import HubspotClient from '../hubspot-client'

interface ContactProperties {
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

interface ContactCreateRequestPayload {
  properties: ContactProperties
}

interface ContactUpdateRequestPayload {
  id: string
  properties: ContactProperties
}

interface ContactSuccessResponse {
  id: string
  properties: Record<string, string | null>
}

interface ContactErrorResponse {
  status: string
  category: string
  message: string
  context: {
    ids: string[]
    [key: string]: unknown
  }
}

export interface ContactBatchResponse {
  status: string
  results: ContactSuccessResponse[]
  numErrors?: number
  errors?: ContactErrorResponse[]
}
export interface BatchContactResponse {
  data: ContactBatchResponse
}

interface ContactsUpsertMapItem {
  action: 'create' | 'update' | 'undefined'
  payload: {
    id?: string
    properties: ContactProperties
  }
}

const action: ActionDefinition<Settings, Payload> = {
  title: 'Upsert Contact',
  description: 'Create or update a contact in HubSpot.',
  defaultSubscription: 'type = "identify"',
  fields: {
    /* 
      Ideally the email field shouldn't be named email as it allows for any identify value to be provided. 
      The ability to provide Hubspot with any identifier type was added after this field was defined.
      It was decided that the email field would remain in place, rather than needing to run a DB migration  
    */
    email: {
      label: 'Identifier Value',
      type: 'string',
      description:
        "An Identifier for the Contact. This can be the Contact's email address or the value of any other unique Contact property. If an existing Contact is found, Segment will update the Contact. If a Contact is not found, Segment will create a new Contact.",
      required: true,
      default: {
        '@path': '$.traits.email'
      }
    },
    identifier_type: {
      label: 'Identifier Type',
      type: 'string',
      description:
        'The type of identifier used to uniquely identify the Contact. This defaults to email, but can be set to be any unique Contact property.',
      dynamic: true,
      required: false,
      default: 'email'
    },
    canonical_id: {
      label: 'Canonical Contact Identifier Value',
      type: 'string',
      description: 'Hidden field use to store the canonical identifier for the Contact during processing.',
      unsafe_hidden: true,
      required: false,
      default: undefined
    },
    company: {
      label: 'Company Name',
      type: 'string',
      description: 'The contact’s company.',
      default: {
        '@path': '$.traits.company'
      }
    },
    firstname: {
      label: 'First Name',
      type: 'string',
      description: 'The contact’s first name.',
      default: {
        '@if': {
          exists: { '@path': '$.traits.first_name' },
          then: { '@path': '$.traits.first_name' },
          else: { '@path': '$.traits.firstName' }
        }
      }
    },
    lastname: {
      label: 'Last Name',
      type: 'string',
      description: 'The contact’s last name.',
      default: {
        '@if': {
          exists: { '@path': '$.traits.last_name' },
          then: { '@path': '$.traits.last_name' },
          else: { '@path': '$.traits.lastName' }
        }
      }
    },
    phone: {
      label: 'Phone',
      type: 'string',
      description: 'The contact’s phone number.',
      default: {
        '@path': '$.traits.phone'
      }
    },
    address: {
      label: 'Street Address',
      type: 'string',
      description: "The contact's street address, including apartment or unit number.",
      default: {
        '@path': '$.traits.address.street'
      }
    },
    city: {
      label: 'City',
      type: 'string',
      description: "The contact's city of residence.",
      default: {
        '@path': '$.traits.address.city'
      }
    },
    state: {
      label: 'State',
      type: 'string',
      description: "The contact's state of residence.",
      default: {
        '@path': '$.traits.address.state'
      }
    },
    country: {
      label: 'Country',
      type: 'string',
      description: "The contact's country of residence.",
      default: {
        '@path': '$.traits.address.country'
      }
    },
    zip: {
      label: 'Postal Code',
      type: 'string',
      description: "The contact's zip code.",
      default: {
        '@if': {
          exists: { '@path': '$.traits.address.postalCode' },
          then: { '@path': '$.traits.address.postalCode' },
          else: { '@path': '$.traits.address.postal_code' }
        }
      }
    },
    website: {
      label: 'Website',
      type: 'string',
      description: 'The contact’s company/other website.',
      default: {
        '@path': '$.traits.website'
      }
    },
    lifecyclestage: {
      label: 'Lifecycle Stage',
      type: 'string',
      description:
        'The contact’s stage within the marketing/sales process. See more information on default and custom stages in [HubSpot’s documentation](https://knowledge.hubspot.com/contacts/use-lifecycle-stages). Segment supports moving status forwards or backwards.'
    },
    properties: {
      label: 'Other properties',
      type: 'object',
      description:
        'Any other default or custom contact properties. On the left-hand side, input the internal name of the property as seen in your HubSpot account. On the right-hand side, map the Segment field that contains the value. Custom properties must be predefined in HubSpot. See more information in [HubSpot’s documentation](https://knowledge.hubspot.com/crm-setup/manage-your-properties#create-custom-properties).',
      defaultObjectUI: 'keyvalue:only'
    },
    enable_batching: {
      type: 'boolean',
      label: 'Send Batch Data to HubSpot',
      description:
        'If true, Segment will batch events before sending to HubSpot’s API endpoint. HubSpot accepts batches of up to 100 events. Note: Contacts created with batch endpoint can’t be associated to a Company from the UpsertCompany Action.',
      default: false
    }
  },
  // perform: async (request, { payload, transactionContext, settings }) => {
  //   const client = new HubspotClient(settings, request) 
  //   return client.createOrUpdateSingleContact(payload, transactionContext)
  // },

  perform: async (request, data) => {
    const { payload, settings } = data
    const p1 = {...payload, email: 'main_email_1@gmail.com', lifecyclestage:'lead'}
    const p2 = {...payload, email: 'blahblah_oh_no', identifier_type: 'external_id_type_1', lifecyclestage:'Opportunity'}
    const p3 = {...payload, email: 'monkeyman@example.org', lifecyclestage:'lead'}
    const payloads = [p1,p2,p3]

    const client = new HubspotClient(settings, request) 
    return client.getAllBatchContacts(payloads)

    // const { createList, updateList } = buildUpsertPayloadLists(readResponses, payloadsByIdTypes)
    // // Create contacts that don't exist in HubSpot
    // if (createList.length > 0) {
    //   await createContactsBatch(request, createList)
    // }

    // if (updateList.length > 0) {
    //   // Update contacts that already exist in HubSpot
    //   const updateContactResponse = await updateContactsBatch(request, updateList)

    //   // Check if Life Cycle Stage update was successful, and pick the ones that didn't succeed
    //   await checkAndRetryUpdatingLifecycleStage(request, updateContactResponse)
    // }
  }
}

async function readContactsBatch(request: RequestClient, emails: string[]) {
  const requestPayload = {
    properties: ['email', 'lifecyclestage', 'hs_additional_emails'],
    idProperty: 'email',
    inputs: emails.map((email) => ({
      id: email
    }))
  }

  return request<ContactBatchResponse>(`${HUBSPOT_BASE_URL}/crm/v3/objects/contacts/batch/read`, {
    method: 'POST',
    json: requestPayload
  })
}

async function createContactsBatch(request: RequestClient, contactCreatePayload: ContactCreateRequestPayload[]) {
  return request<ContactBatchResponse>(`${HUBSPOT_BASE_URL}/crm/v3/objects/contacts/batch/create`, {
    method: 'POST',
    json: {
      inputs: contactCreatePayload
    }
  })
}

async function updateContactsBatch(request: RequestClient, contactUpdatePayload: ContactUpdateRequestPayload[]) {
  return request<ContactBatchResponse>(`${HUBSPOT_BASE_URL}/crm/v3/objects/contacts/batch/update`, {
    method: 'POST',
    json: {
      inputs: contactUpdatePayload
    }
  })
}

function mapUpsertContactPayload(payload: Payload[]) {
  // Create a map of email & id to contact upsert payloads
  // Record<Email and ID, ContactsUpsertMapItem>
  const contactsUpsertMap: Record<string, ContactsUpsertMapItem> = {}
  for (const contact of payload) {
    contactsUpsertMap[contact.email.toLowerCase()] = {
      // Setting initial state to undefined as we don't know if the contact exists in HubSpot
      action: 'undefined',

      payload: {
        // Skip setting the id as we don't know if the contact exists in HubSpot
        properties: {
          company: contact.company,
          firstname: contact.firstname,
          lastname: contact.lastname,
          phone: contact.phone,
          address: contact.address,
          city: contact.city,
          state: contact.state,
          country: contact.country,
          zip: contact.zip,
          email: contact.email.toLowerCase(),
          website: contact.website,
          lifecyclestage: contact.lifecyclestage?.toLowerCase(),
          ...flattenObject(contact.properties)
        }
      }
    }
  }

  return contactsUpsertMap
}

function updateActionsForBatchedContacts(
  readResponse: BatchContactResponse,
  contactsUpsertMap: Record<string, ContactsUpsertMapItem>
) {
  // Throw any other error responses
  // Case 1: Loop over results if there are any
  if (readResponse.data?.results && readResponse.data.results.length > 0) {
    //create and map payload to update contact
    contactsUpsertMap = createPayloadToUpdateContact(readResponse, contactsUpsertMap)
  }

  // Case 2: Loop over errors if there are any
  if (readResponse.data?.numErrors && readResponse.data.errors) {
    for (const error of readResponse.data.errors) {
      if (error.status === 'error' && error.category === 'OBJECT_NOT_FOUND') {
        // Set the action to create for contacts that don't exist in HubSpot
        for (const id of error.context.ids) {
          //Set Action to create
          contactsUpsertMap[id].action = 'create'
        }
      } else {
        // Throw any other error responses
        throw new IntegrationError(error.message, error.category, 400)
      }
    }
  }
  return contactsUpsertMap
}
async function checkAndRetryUpdatingLifecycleStage(
  request: RequestClient,
  updateContactResponse: BatchContactResponse,
  contactsUpsertMap: Record<string, ContactsUpsertMapItem>
) {
  // Check if Life Cycle Stage update was successful, and pick the ones that didn't succeed
  const resetLifeCycleStagePayload: ContactUpdateRequestPayload[] = []
  const retryLifeCycleStagePayload: ContactUpdateRequestPayload[] = []

  for (const result of updateContactResponse.data.results) {
    const key = Object.keys(contactsUpsertMap).find((key) => contactsUpsertMap[key].payload.id == result.id)
    const desiredLifeCycleStage = key ? contactsUpsertMap[key]?.payload?.properties?.lifecyclestage : null
    const currentLifeCycleStage = result.properties.lifecyclestage

    if (desiredLifeCycleStage && desiredLifeCycleStage !== currentLifeCycleStage) {
      resetLifeCycleStagePayload.push({
        id: result.id,
        properties: {
          lifecyclestage: ''
        }
      })

      retryLifeCycleStagePayload.push({
        id: result.id,
        properties: {
          lifecyclestage: desiredLifeCycleStage
        }
      })
    }
  }
  // Retry Life Cycle Stage Updates
  if (retryLifeCycleStagePayload.length > 0) {
    // Reset Life Cycle Stage
    await updateContactsBatch(request, resetLifeCycleStagePayload)

    // Set the new Life Cycle Stage
    await updateContactsBatch(request, retryLifeCycleStagePayload)
  }
}

function createPayloadToUpdateContact(
  readResponse: BatchContactResponse,
  contactsUpsertMap: Record<string, ContactsUpsertMapItem>
) {
  for (const result of readResponse.data.results) {
    let email: string | undefined | null
    //Each Hubspot Contact can have mutiple email addresses ,one as primary and others as secondary emails
    if (!contactsUpsertMap[`${result.properties.email}`]) {
      // If contact is not getting mapped with Primary email then checking it in secondary email for same contact.
      if (result.properties.hs_additional_emails) {
        const secondaryEmails = split(result.properties.hs_additional_emails, ';')
        email = Object.keys(contactsUpsertMap).find((key) => secondaryEmails.includes(key))
      }
    } else {
      email = result.properties.email
    }
    if (email) {
      // Set the action to update for contacts that exist in HubSpot
      contactsUpsertMap[email].action = 'update'
      // Set the id for contacts that exist in HubSpot
      contactsUpsertMap[email].payload.id = result.id
    }
  }
  return contactsUpsertMap
}
export default action
