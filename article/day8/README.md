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

### 241205 update, Amazon Q recommand
```json
// Example S3 bucket structure
bucket/
  users/
    ${cognito-user-id}/  // Private directory for each user
      files/
    shared/
      ${file-id}/  // Shared files area
```

```json{
   {
    "Version": "2012-10-01",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListObject"
            ],
            "Resource": [
                "arn:aws:s3:::${bucket-name}/users/${cognito:sub}/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::${bucket-name}",
            "Condition": {
                "StringLike": {
                    "s3:prefix": ["users/${cognito:sub}/*"]
                }
            }
        }
    ]
}
```

```typescript// DynamoDB table structure
{
    fileId: string, // partition key
    ownerId: string, // Cognito user ID of owner
    sharedWith: string[], // Array of Cognito user IDs
    s3Key: string, // S3 object key
    fileName: string,
    shareDate: timestamp
}
```

```python
def share_file(user_id, file_id, share_with_user_id):
    # Copy file to shared directory
    source_key = f"users/{user_id}/{file_id}"
    shared_key = f"shared/{file_id}"
    
    # Copy the file to shared location
    s3_client.copy_object(
        Bucket=BUCKET_NAME,
        CopySource=f"{BUCKET_NAME}/{source_key}",
        Key=shared_key
    )
    
    # Update sharing information in DynamoDB
    dynamodb.put_item(
        TableName=SHARES_TABLE,
        Item={
            'fileId': file_id,
            'ownerId': user_id,
            'sharedWith': [share_with_user_id],
            's3Key': shared_key,
            'shareDate': datetime.now().isoformat()
        }
    )
```

```python
# Example API routes
@app.route('/share', methods=['POST'])
@cognito_auth_required
def share_file():
    current_user = get_current_user()
    file_id = request.json['fileId']
    share_with_user = request.json['shareWithUser']
    
    return share_file(current_user.sub, file_id, share_with_user)

@app.route('/shared-with-me', methods=['GET'])
@cognito_auth_required
def get_shared_files():
    current_user = get_current_user()
    # Query DynamoDB for files shared with current user
    shared_files = dynamodb.query(
        TableName=SHARES_TABLE,
        IndexName='sharedWith-index',
        KeyConditionExpression='sharedWith = :user_id',
        ExpressionAttributeValues={
            ':user_id': current_user.sub
        }
    )
    return shared_files
```