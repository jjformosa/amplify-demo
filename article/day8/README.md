## Summary Of Cognito
其實到目前只用了Cognito大概一半的好處而已，但我們要先覆盤然後放下它一下
1. 可以先獨立熟悉Cognito的運作，但還是建議Amplify要用的透過配置檔去定義。
2. 注意LambdaTrigger真實收到的參數，雖然名稱一樣，但不見得是你在client端輸入的userAttributes、ClientMetadata。
3. AdminLinkProvider已經讓Cognito可以整合多個帳號到一個帳號上，但是被連結的帳號實際上不能是登入狀態。
4. 沒有被連結的帳號，每一個ExternalProvider都是獨立的帳號，且Username為${ProviderName}_${sub}

## 管理檔案
我知道Amplify在過了Auth這村，是先提供Data的教材，但是因為工作需要，而且NoSQL嚴格說起來，要講深更複雜，所以先實作檔案的部分。