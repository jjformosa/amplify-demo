import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'amplifyDemoDrive',
  access: (allow) => ({
    'private/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'personal/{entity_id}/*':[
        // only owner can read, write, delete
        allow.entity('identity').to(['read', 'write', 'delete']),
        allow.groups(['admin']).to(['read', 'delete']),
        // allow.authenticated.to(['read']), Specify user
    ],
    'public/{entity_id}/*': [
        allow.entity('identity').to(['read', 'write', 'delete']),
        allow.groups(['admin']).to(['read', 'delete']),
        allow.authenticated.to(['read'])
    ]
  })
});

export const secondBucket = defineStorage({
  name: 'secondBucket',
  isDefault: true,
  access: (allow) => ({
    'private/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete'])
    ]
  })
})