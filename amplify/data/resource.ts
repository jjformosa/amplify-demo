import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
const schema = a.schema({
  Todo: a
    .model({
      id: a.id().required(),                //[Day9] add
      createdAt: a.datetime().required(),   //[Day9] add
      updatedAt: a.datetime().required(),   //[Day9] add
      author: a.string().required(),        //[Day9] add
      authorName: a.string(),               //[Day9] add, not used
      done: a.boolean().default(false),     //[Day9] add, not used
      content: a.string(),
    })
    //.identifier(['id'])        //[Day9] add, but not used
    .secondaryIndexes((index) => [
      index('author').sortKeys(['createdAt']).name('sortByCreatedAt').queryField('sortByCreatedAt') //[Day9] add
    ])
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete'])
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

