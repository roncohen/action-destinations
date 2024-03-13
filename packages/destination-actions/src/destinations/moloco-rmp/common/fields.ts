import { InputField } from '@segment/actions-core/destination-kit/types'

export const event_id: InputField = {
  label: 'Event ID',
  description:
    'Unique ID generated by the client to suppress duplicate events. The length should not exceed 128 characters.',
  type: 'string',
  required: false,
  default: {
    '@path': '$.messageId'
  }
}

export const timestamp: InputField = {
  label: 'Timestamp',
  description: 'Timestamp that the event happened at.',
  type: 'datetime',
  required: true,
  default: {
    '@path': '$.timestamp'
  }
}

export const user_id: InputField = {
  label: 'User ID',
  description: 'User Identifier for the platform. The length should not exceed 128 characters.',
  type: 'string',
  required: false,
  default: {
    '@path': '$.userId'
  }
}

export const device: InputField = {
  label: 'Device',
  description: `Device information of the event`,
  type: 'object',
  required: false,
  properties: {
    os: {
      label: 'OS',
      description: 'OS of the device. "ios" or "android" must be included for the APP channel type.',
      type: 'string',
      required: false
    },
    os_version: {
      label: 'OS Version',
      description:
        'Device OS version, which is taken from the device without manipulation or normalization. (e.g., "14.4.1")',
      type: 'string',
      required: false
    },
    advertising_id: {
      label: 'Advertising ID',
      description:
        'For app traffic, IDFA of iOS or ADID of android should be filled in this field. (e.g., 7acefbed-d1f6-4e4e-aa26-74e93dd017e4)',
      type: 'string',
      required: false
    },
    unique_device_id: {
      label: 'Unique Device ID',
      description: `For app traffic, a unique identifier for the device being used should be provided in this field.
  Clients can issue identifiers for their user devices or use their IDFV values if using iOS apps.
  The length of this id should not exceed 128 characters.`,
      type: 'string',
      required: false
    },
    model: {
      label: 'Model',
      description:
        'Device model, which is taken from the device without manipulation or normalization. (e.g., "iPhone 11 Pro")',
      type: 'string',
      required: false
    },
    ua: {
      label: 'User Agent',
      description:
        'User Agent. (e.g., "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/111FFF")',
      type: 'string',
      required: false
    },
    language: {
      label: 'Language',
      description: 'ISO-639-1 alpha-2 language code. (e.g., "en")',
      type: 'string',
      required: false
    },
    ip: {
      label: 'IP Address',
      description: 'IP in IPv4 format. (e.g., 216.212.237.213)',
      type: 'string',
      required: false
    }
  },
  default: {
    os: { '@path': '$.context.os.name' },
    os_version: { '@path': '$.context.os.version' },
    advertising_id: { '@path': '$.context.device.advertisingId' },
    unique_device_id: { '@path': '$.context.device.id' },
    model: { '@path': '$.context.device.model' },
    ua: { '@path': '$.context.userAgent' },
    ip: { '@path': '$.context.ip' }
  }
}

export const session_id: InputField = {
  label: 'Session ID',
  description:
    'Identifier for tracking users regardless of sign-in status. The length should not exceed 128 characters.',
  type: 'string',
  required: false,
  default: {
    '@path': '$.anonymousId'
  }
}

export const default_currency: InputField = {
  label: 'Default Currency',
  description:
    'The default currency value. Defaults to "USD". If this is set, it will be used as a default currency value for items.',
  choices: [
    { label: 'UNKNOWN_CURRENCY', value: 'UNKNOWN_CURRENCY' },
    { label: 'USD', value: 'USD' },
    { label: 'KRW', value: 'KRW' },
    { label: 'JPY', value: 'JPY' },
    { label: 'EUR', value: 'EUR' },
    { label: 'GBP', value: 'GBP' },
    { label: 'SEK', value: 'SEK' },
    { label: 'INR', value: 'INR' },
    { label: 'THB', value: 'THB' },
    { label: 'IDR', value: 'IDR' },
    { label: 'CNY', value: 'CNY' },
    { label: 'CAD', value: 'CAD' },
    { label: 'RUB', value: 'RUB' },
    { label: 'BRL', value: 'BRL' },
    { label: 'SGD', value: 'SGD' },
    { label: 'HKD', value: 'HKD' },
    { label: 'AUD', value: 'AUD' },
    { label: 'PLN', value: 'PLN' },
    { label: 'DKK', value: 'DKK' },
    { label: 'VND', value: 'VND' },
    { label: 'MYR', value: 'MYR' },
    { label: 'PHP', value: 'PHP' },
    { label: 'TRY', value: 'TRY' },
    { label: 'VEF', value: 'VEF' }
  ],
  default: 'USD',
  type: 'string',
  required: false
}

export const items: InputField = {
  label: 'Items',
  description: 'Item information list related to the event.',
  type: 'object',
  required: false,
  multiple: true,
  properties: {
    id: {
      label: 'ID',
      description: 'Unique identifier of the Item.',
      type: 'string',
      required: true
    },
    price: {
      label: 'Price',
      description:
        'Monetary amount without currency, e.g. 12.34. This field is required if the Currency field is populated.',
      type: 'number',
      required: false
    },
    currency: {
      label: 'Currency',
      description: 'Currency information. This field is required if the Price field is populated.',
      choices: [
        { label: 'UNKNOWN_CURRENCY', value: 'UNKNOWN_CURRENCY' },
        { label: 'USD', value: 'USD' },
        { label: 'KRW', value: 'KRW' },
        { label: 'JPY', value: 'JPY' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
        { label: 'SEK', value: 'SEK' },
        { label: 'INR', value: 'INR' },
        { label: 'THB', value: 'THB' },
        { label: 'IDR', value: 'IDR' },
        { label: 'CNY', value: 'CNY' },
        { label: 'CAD', value: 'CAD' },
        { label: 'RUB', value: 'RUB' },
        { label: 'BRL', value: 'BRL' },
        { label: 'SGD', value: 'SGD' },
        { label: 'HKD', value: 'HKD' },
        { label: 'AUD', value: 'AUD' },
        { label: 'PLN', value: 'PLN' },
        { label: 'DKK', value: 'DKK' },
        { label: 'VND', value: 'VND' },
        { label: 'MYR', value: 'MYR' },
        { label: 'PHP', value: 'PHP' },
        { label: 'TRY', value: 'TRY' },
        { label: 'VEF', value: 'VEF' }
      ],
      type: 'string',
      required: false
    },
    quantity: {
      label: 'Quantity',
      description: 'Quantity of the item. Recommended.',
      type: 'integer',
      required: false
    },
    seller_id: {
      label: 'Seller ID',
      description: 'Unique identifier of the Seller.',
      type: 'string',
      required: false
    }
  },
  default: {
    '@arrayPath': [
      '$.properties.products',
      {
        id: { '@path': '$.product_id' },
        price: { '@path': '$.price' },
        currency: { '@path': '$.currency' },
        quantity: { '@path': '$.quantity' },
        seller_id: { '@path': '$.seller_id' }
      }
    ]
  }
}

export const revenue: InputField = {
  label: 'Revenue',
  description: 'Revenue of the event',
  type: 'object',
  required: false,
  additionalProperties: false,
  properties: {
    price: {
      label: 'Price',
      description:
        'Monetary amount without currency, e.g. 12.34. This field is required if the Currency field is populated.',
      type: 'number',
      required: true
    },
    currency: {
      label: 'Currency',
      description: 'Currency information. This field is required if the Price field is populated.',
      choices: [
        { label: 'UNKNOWN_CURRENCY', value: 'UNKNOWN_CURRENCY' },
        { label: 'USD', value: 'USD' },
        { label: 'KRW', value: 'KRW' },
        { label: 'JPY', value: 'JPY' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
        { label: 'SEK', value: 'SEK' },
        { label: 'INR', value: 'INR' },
        { label: 'THB', value: 'THB' },
        { label: 'IDR', value: 'IDR' },
        { label: 'CNY', value: 'CNY' },
        { label: 'CAD', value: 'CAD' },
        { label: 'RUB', value: 'RUB' },
        { label: 'BRL', value: 'BRL' },
        { label: 'SGD', value: 'SGD' },
        { label: 'HKD', value: 'HKD' },
        { label: 'AUD', value: 'AUD' },
        { label: 'PLN', value: 'PLN' },
        { label: 'DKK', value: 'DKK' },
        { label: 'VND', value: 'VND' },
        { label: 'MYR', value: 'MYR' },
        { label: 'PHP', value: 'PHP' },
        { label: 'TRY', value: 'TRY' },
        { label: 'VEF', value: 'VEF' }
      ],
      type: 'string',
      required: true
    }
  },
  default: {
    price: { '@path': '$.properties.revenue' },
    currency: { '@path': '$.properties.currency' }
  }
}

export const search_query: InputField = {
  label: 'Search Query',
  description: 'Query string for the search.',
  type: 'string',
  required: false,
  default: {
    '@path': '$.properties.query'
  }
}

export const page_id: InputField = {
  label: 'Page ID',
  description: `A string value used to uniquely identify a page. For example: "electronics", "categories/12312", "azd911d" or "/classes/foo/lectures/bar".`,
  type: 'string',
  required: false,
  default: {
    '@path': '$.context.page.path'
  }
}

export const page_identifier_tokens: InputField = {
  label: 'Page Identifier Tokens',
  description: 'Tokens that can be used to identify a page. Alternative to page_id with a lower priority.',
  type: 'object',
  defaultObjectUI: 'keyvalue',
  required: false
}

export const referrer_page_id: InputField = {
  label: 'Referrer Page ID',
  description: 'Similar to referrer in HTTP, this value indicates from which page the user came to the current page.',
  type: 'string',
  required: false,
  default: {
    '@path': '$.context.page.referrer'
  }
}

export const shipping_charge: InputField = {
  label: 'Shipping Charge',
  description: 'Shipping charge’s monetary amount in a specific currency.',
  type: 'object',
  required: false,
  properties: {
    price: {
      label: 'Price',
      description:
        'Monetary amount without currency, e.g. 12.34. This field is required if the Currency field is populated.',
      type: 'number',
      required: true
    },
    currency: {
      label: 'Currency',
      description: 'Currency information. This field is required if the Price field is populated.',
      choices: [
        { label: 'UNKNOWN_CURRENCY', value: 'UNKNOWN_CURRENCY' },
        { label: 'USD', value: 'USD' },
        { label: 'KRW', value: 'KRW' },
        { label: 'JPY', value: 'JPY' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
        { label: 'SEK', value: 'SEK' },
        { label: 'INR', value: 'INR' },
        { label: 'THB', value: 'THB' },
        { label: 'IDR', value: 'IDR' },
        { label: 'CNY', value: 'CNY' },
        { label: 'CAD', value: 'CAD' },
        { label: 'RUB', value: 'RUB' },
        { label: 'BRL', value: 'BRL' },
        { label: 'SGD', value: 'SGD' },
        { label: 'HKD', value: 'HKD' },
        { label: 'AUD', value: 'AUD' },
        { label: 'PLN', value: 'PLN' },
        { label: 'DKK', value: 'DKK' },
        { label: 'VND', value: 'VND' },
        { label: 'MYR', value: 'MYR' },
        { label: 'PHP', value: 'PHP' },
        { label: 'TRY', value: 'TRY' },
        { label: 'VEF', value: 'VEF' }
      ],
      type: 'string',
      required: true
    }
  }
}
