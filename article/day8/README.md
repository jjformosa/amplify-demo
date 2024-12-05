## Summary Of Cognito
其實到目前只用了Cognito大概一半的好處而已，但我們要先覆盤然後放下它一下
1. 可以先獨立熟悉Cognito的運作，但還是建議Amplify要用的透過配置檔去定義。
2. 注意LambdaTrigger真實收到的參數，雖然名稱一樣，但不見得是你在client端輸入的userAttributes、ClientMetadata。
3. AdminLinkProvider已經讓Cognito可以整合多個帳號到一個帳號上，但是被連結的帳號實際上不能是signup狀態。
4. 沒有被連結的帳號，每一個ExternalProvider都是獨立的帳號，且Username為${ProviderName}_${sub}

## 管理檔案
我知道Amplify在過了Auth這村，是先提供Data的教材，但是因為工作需要，而且NoSQL嚴格說起來，要講深更複雜，所以先實作檔案的部分。

其實Storage很單純，跟著[官方文件走就沒甚麼問題](https://docs.amplify.aws/react/build-a-backend/storage/)，但需要memo一下:

```typescript
// amplify/storage/resource.ts
export const secondBucket = defineStorage({
  name: 'secondBucket',
  isDefault: true,
  access: (allow) => ({
    'private/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete'])
    ]
  })
})
```

這樣會在使用list的時候收到錯誤:AccessDenied: User: arn:aws:sts:....../CognitoIdentityCredentials is not authorized to perform: s3:ListBucket on resource: "arn:aws:s3:::amplify-...... because no identity-based policy allows the s3:ListBucket action

```typescript
// amplify/storage/resource.ts
export const secondBucket = defineStorage({
  name: 'secondBucket',
  isDefault: true,
  access: (allow) => ({
    'private/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.authenticated.to(['read'])
    ]
  })
})
```
**加上了authenticated才能使用list。**

但是，因為我希望能做到由擁有者可以share其他一樣透過cognito的登入者，但只有指定的對象，但目前的設定沒辦法做到這件事。