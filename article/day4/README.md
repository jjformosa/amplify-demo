## 我換了一個git repo
因為而且從這章起，auth資源最好來自ampfliy/auth/resources定義。

[**強烈建議延伸閱讀官方文件，看Cognito怎麼與OIDC合作的**](https://docs.aws.amazon.com/zh_tw/cognito/latest/developerguide/cognito-user-pools-oidc-flow.html)

![cognito 與 oidc的互動](./resources/p4.png)

[Amplify的解決方案](https://docs.amplify.aws/react/build-a-backend/data/customize-authz/using-oidc-authorization-provider/)依然很難客製化，而從上圖看起來，只需要把第三方的token交給Cognito，並且告訴它這是來自哪個第三方(External Provider)即可。

> 其實我忘了當初flow怎麼找到文件的，以下解答來自Amazon Q的說明

```typescript
import { signIn, type SignInInput } from 'aws-amplify/auth';

interface OIDCAuthParams {
  accessToken: string;
  idToken: string;
  // other OIDC-specific parameters
}

async function handleOIDCSignIn(oidcParams: OIDCAuthParams) {
  try {
    // Extract relevant information from OIDC tokens
    const signInInput: SignInInput = {
      username: 'user_identifier', // This could be email or other unique identifier
      options: {
        authFlowType: 'CUSTOM_WITHOUT_SRP',
        clientMetadata: {
          identitySource: 'amplify-demo-line-provider',
          accessToken: oidcParams.accessToken,
          idToken: oidcParams.idToken
        },
        // You might need to include additional attributes
        userAttributes: {
          // Map OIDC claims to Cognito attributes
          email: 'user@example.com',
          // other attributes as needed
        }
      }
    };

    const signInResult = await signIn(signInInput);

    if (signInResult.isSignedIn) {
      // Handle successful sign-in
      return signInResult;
    } else if (signInResult.nextStep) {
      // Handle any additional steps if required
      console.log('Additional step required:', signInResult.nextStep.signInStep);
      // You might need to handle various nextStep scenarios
    }
  } catch (error) {
    console.error('OIDC sign-in failed:', error);
    throw error;
  }
}

// Example usage with custom UI
async function handleCustomUILogin() {
  // 1. First handle the OIDC authentication through your custom UI
  // 2. Get the OIDC tokens from your provider
  const oidcParams = {
    accessToken: 'your-access-token',
    idToken: 'your-id-token'
  };

  // 3. Use the tokens to sign in with Amplify
  try {
    const result = await handleOIDCSignIn(oidcParams);
    // Handle the sign-in result
  } catch (error) {
    // Handle errors
  }
}
```

從Amazon Q的建議來看，大致上可以知道，實務上如果想要完全取代AWS本身提供的畫面，我們還是要自己實作第三方登入，拿到token以後，透過 *CUSTOM_WITHOUT_SRP* 模式，向Cognito請求登入。這也符合我的期望，因為liff在適合的環境底下，是不會讓使用者感受到跳轉的登入流程，所以大致來說先試試看以下想法:

```
// src/services/amplify/auth.ts 
// 定義loginWithLiff方法，接收accessToken與idToken

// src/context/amplify/AuthContext.tsx
// store Amplify Auth狀態

// src/hook/amplify/auth/useAmplifyAuth.tsx
// 引用AuthContext
// 使用生命週期，在畫面產生前就先檢查Amplify Auth狀態

// src/context/LiffContext.tsx
// store liff狀態

// src/hook/line/useLiff.tsx
// 引用LiffContext
// 使用生命週期，在畫面產生前就先檢查liff狀態

// src/pages/Home.tsx
// 引用[hook]useAmplifyAuth，如果hook檢查後發現尚未登入，轉到登入畫面

// src/pages/Login.tsx
// 引用[hook]userLiff、useAmplifyAuth，設計UI觸發liff.login
```
