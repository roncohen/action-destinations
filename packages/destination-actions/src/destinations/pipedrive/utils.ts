type PayloadWithCustomFields = { custom_fields?: { [k: string]: unknown } }

export function addCustomFieldsFromPayloadToEntity<E>(payload: PayloadWithCustomFields, entity: E) {
  if (!payload.custom_fields) {
    return
  }
  Object.assign(entity as {}, payload.custom_fields)
}
