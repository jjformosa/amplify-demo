因為Authorization的部分可以暫告一段落了，這篇要配合公司同事的進度，先來簡單講一些React的特性。

## What's for
到2024年為止，最流行的框架React、Vue和Angular(Angular我不熟，而且它的身分有過大轉變，故我的文章基本都排除它)，不論你是何時、甚麼場景下接觸它們的，它們已經進化出多酷炫的架構了，請始終銘記它們的宗旨:
> 解決渲染問題
除此以外都是作者做功德(~~引戰~~)的部分。到目前來說，不論是flex、redux還是雙向綁定，都是為了讓前端工作者以一種接近後端的方式，只要面對資料不需要過度費心處理DOM部分。

## ReactJS
- ReactJS以一種很好的方式向開發者介紹網頁開發常被忽略的部分:生命週期，而且它非常強調每個階段可以做甚麼、不應該做甚麼，培養好這個習慣，即使在被迫寫瀏覽器原生JS的場合對效能也很有幫助，事實上我認為在ReactJS生命週期下過功夫後，即使在寫App、Server端也很有幫助。
- 絕對的單向資料流，hook的出現只是實現局部的狀態維護，並不是就變成雙向綁定。

但是，我就不打算比較較早時代的Component、HOC等寫法了，除非有接觸其他專案的機會(~~因為忘光了要抄別人的~~)，只整理一些可能會對新手造成困擾的用法。

## 甚麼是hook
先抱怨一下這個名字實在是被太濫用了。
在ReactJS剛問世的時候，官方分了兩大類寫法:class和functional Component, 我不太確定是不是剛好對應OOP與FP風格，總之那時只有class可以透過state的管理做到局部、自我更新資料來更新畫面，而functional只能接收props，沒有辦法透過更新自己的資料來改變畫面，必須開callback或是將dispatcher當作props，傳到functional Component中，透過事件去更新父(class)元件的state=>props=>子(functional)元件。
這個模式使得資料可以很安全，而且functional Component相當輕巧、易複用，但是在複雜的畫面上，這就造成一個問題，假設有一個子元件跟持有state的根元件距離十個元件之遠，而中間的元件都不需要使用根的某筆資料，但是為了要傳遞給10代以外的子元件，中間的元件就都要開Props來做傳遞。這會造成中間層的可維護性大幅下滑。
> 例如，畫面中有一個登入者的Profile資訊固定在左上角，但是UI/UX導致某個主畫面中的小功能，可以臨時修改Profile，OK，如果是這樣，可能工程師看到線稿或設計稿就知道要一路傳遞資料到10代開外；但如果這個編輯器，是在某個按鈕點擊後的對話盒，一些資深的**前端工程師** 可以設計一個全域、被臨時呼叫Show Model機制。但如果，這需求本身來自需求變更呢?
### useContext
後來出現context這個工具來解決資料傳遞的問題，被context.provider包覆的元件都可以透過Context取得資料或者呼叫功能，不管元件在Component的位階在第幾層。
```tsx
// src/App.tsx
<LiffProvider liffId='2004822790-ndEy8LlX'>
    <AmplifyAuthProvider>
        <RouterProvider router={router} />
    </AmplifyAuthProvider>
</LiffProvider>
```

```tsx
// src/hook/line/useLiff.tsx
const context = useContext(LiffContext)

const updateAuth = useCallback(async () => {
const isLoggedIn = await context.isAuth()
const accessToken = context.auth?.accessToken ?? null
const idToken = context.auth?.idToken ?? null
const decodedIdToken = context.auth?.idTokenPayload
setLiffState({
        ...liffState,
        isLoggedIn,
        accessToken,
        idToken,
        name: decodedIdToken?.name ?? null,
        email: decodedIdToken?.email ?? null,
        picture: (decodedIdToken?.picture as string) ?? null
    })
  }, [context.auth])
```
如上面兩段程式碼，hook/liff可以專心於觀察context/liff的變化，雖然在hook/liff也可以透過useContext取得context/amplify的資料，但權責不在這支程式內的，就不要去引用、觀察，甚至觸發改變。話說ReactJS在這邊的命名，讓我想到事件風暴也用Context來描述Boundary建立後的權責[^1]，希望有生之年能接觸到實務落地的團隊可以比較看看。
另外，useContext才是hook提供的部分，原本的Context是用Context.provider與Context.comsumer做搭配，撰寫上會比較像輕量、好讀版的HOC，但useContext相較更可以在需要資料的元件內部才使用，所以我比較喜歡用hook版本。

### useEffect
這算是hook裡面最重要的工具了，我也還在一邊重新摸熟它。

class Componet相較於functional Component有兩個重點
1. 只有class Component能用state。
2. 只有class Component有lifecycle。
其實說穿了，就是可以變動的交給Class Component管理，Functional Component只作為揭露資料的存在，但是，state跟lifecycle就很難管/懂啊，而且官方都出Context了，不給Functional Component反應資料變更是怎樣?~~而且Junior的事件亂噴看起來也很刺眼~~。
但是不要忘了，稍早說到ReatJS這類lib，最核心的還是解決渲染效能的問題，就連狀態管理都是隨之而來的解決方案不是本體，**但一個工具或框架要永續生存，就不得不解決使用者遭遇到的問題**，軟體工程有一個很好的概念形容這件事情:*side effect*，狀態管理是ReactJS這套lib的解決方案，可是也產生了狀態機本身不好維護的副作用，而hook是解決這些副作用的工具，尤其是，好吧!官方接受Functional Component需要反應資料改變，但依然要限制變化，避免重新渲染的副作用。這就是為什麼，useEffect是hook最重要的工具(至少我希望它是，哈)。
useEffect的結構提供兩個參數，第一個位置需要一個function, 第二個位置是一個陣列，意思是陣列裡面的值有變更的時候，會**觸發function執行**。
在3~5年前，印象中會看到useEffect在Functional Component用來實踐類似lifecycle的機制，今年我在複習的時候已經看不太到這種說法了。但舉例來說:
```typescript
// src/context/LiffContext.tsx
useEffect (() => {
  initLiff()
}, [])
```
effect跟任何參數無關，所以它只會在該元件被創造時執行一次=>初始化=>beforeMount。

```typescript
// src/context/LiffContext.tsx
useEffect(() => {
    console.log('useEffect of Liff', liff)
    const update = async () => {
      if (!liff) return
      if (liff.isLoggedIn()) {
        const accessToken = await liff.getAccessToken()
        const idToken = liff.getIDToken()
        const idTokenPayload = await liff.getDecodedIDToken()
        setAuth({
          ...auth,
          accessToken,
          idToken,
          idTokenPayload: idTokenPayload ? { ...idTokenPayload } : null
        })
      }
    }
    update()
  }, [liff])
```
liff的變化會產生副作用，需要重新檢查使用者是否登入、嘗試索取token=>初始化後=>didMount。但現在應該不太這樣類比了，實現**關注點分離**才是這個工具的本質。另外一個問題是，useEffect本身不能用async修飾，這是因為effect如果有return，必須是distructor時要執行的工作，例如清空資料、移除timer等。所以若真的很需要很需要用ayunc/await，可以像上面的用法，但如果，你的function不只需要並配合關注liff的改變，就會需要用上useCallback了。

### useCallback
```typescript
// src/context/LiffContext.tsx
  const doGetAccessToken = useCallback(async () => {
    if (!liff) return null
    // if (!auth.accessToken) {
    //   const accessToken = liff.getAccessToken()
    //   setAuth({
    //     ...auth,
    //     accessToken
    //   })
    // }
    // return auth.accessToken 
    let accessToken = auth.accessToken
    if (!accessToken) {
      accessToken = liff.getAccessToken()
      setAuth({
        ...auth,
        accessToken
      })
    }
    return accessToken
  }, [liff])
```
我也要藉這章開始收斂一些實驗性的寫法，這邊會看到其實跟上一段程式碼有重工，原本我的習慣是登入成功後，不太介意是頁面/元件先呼叫getAccessToken，還是auth的狀態機先完成初始化，因為也有可能使用者的頁面很急著要accessToken去進行下一步，不想等auth連idToken、profile都完成初始化。但其實這可以交給更應用層次而不是在Context做決定。
另外被我註解掉的一段，如果反註解回來，會發現呼叫doGetAccessToken收到的成果還是null，這是因為setAuth後，auth並沒有立即更新accessToken。
```javascript
if (!auth.accessToken) {
    const accessToken = liff.getAccessToken()
    setAuth({  //這裡更新
        ...auth,
        accessToken
    })
}
return auth.accessToken //但還沒有完成變更，導致呼叫的結果依然是null
```
強烈建議實際動手修改doGetAccessToken觀察的對象，拿掉liff，只有[]的話，會發現怎麼呼叫都只拿到null，而且function永遠都進if(!liff) return null條件。而如果加上auth，[liff, auth]則會遞迴觸發更新到React跳警告。關於hook的記憶，可以看[這篇](https://www.cnblogs.com/guangzan/p/17329688.html)，特別是文內額外強調Trumpkin跟觸發兩次問題。我相信官方說明得也很好，但那是必須的我就不整理連結了。

### useMemo
如果用useMemo取代目前大多數的useCallback，會發現邏輯上毫無差別，當然啦，因為useMemo是值而不是function，還是有很多地方要微調，事實上重構完以後useMemo可能還比較多，那為甚麼原本我只用useCallback呢?因為~~我懶得一開始考慮import這個那個的~~，我習慣給一個API選項，而不是等待state整體完成(這也有賴第三方，如liff跟amplify實作阻塞重複呼叫甚至快取工作)，而且這個專案還是偏重先實踐AWS Amplify的應用。
```javascript
  const doGetAccessToken = useMemo(async () => {
    if (!liff) return null
    let accessToken = auth.accessToken
    if (!accessToken) {
      accessToken = liff.getAccessToken()
      setAuth({
        ...auth,
        accessToken
      })
    }
    return accessToken
  }, [liff])
```

### 單向資料流
或者說，flex、redux的精神，成如前面所說，如果要說個人常年的習慣，尤其是像accesstoken這種deferred/promise模式，我用方法比屬性多，但是要知道，在ReactJS，不論是Class Component的state，還是有hook的Functional Component，都必須更新屬性才能觸發變動。如果有以下程式碼
```typescript
// src/Context/liff.ts
  const doGetAccessToken = useCallback(async () => {
    if (!liff) return null
    let accessToken = auth.accessToken
    if (!accessToken) {
      accessToken = liff.getAccessToken()
      setAuth({
        ...auth,
        accessToken
      })
    }
    return accessToken
  }, [liff])
// src/hook/liff.ts
useEffect(() => {
    const work = async () => {
      if (await context.isAuth()) {
        const accessToken = await context.doGetAccessToken()
        const idToken = await context.getIdToken()
        const decodedIdToken = await context.getDecodedIdToken()
        setLiffState({
          ...liffState,
          isLoggedIn: true,
          accessToken,
          idToken,
          name: decodedIdToken?.name ?? null,
          email: decodedIdToken?.email ?? null,
          picture: (decodedIdToken?.picture as string) ?? null
        })
      }
    }
    if (context.inited) {
      work()
    }
  }, [context.inited])
```
也可以分離關注點
```typescript
// src/hook/liff.ts
  useEffect(() => {
    if (context.auth?.accessToken) {
      setLiffState({
        ...liffState,
        accessToken: context.auth.accessToken
      })
    }
  }, [context.auth?.accessToken])

  useEffect(() => {
    if (context.auth?.idToken) {
      setLiffState({
        ...liffState,
        idToken: context.auth.idToken
      })
    }
  }, [context.auth?.idToken])

  useEffect(() => {
    if (context.auth?.idTokenPayload) {
      const decodedIdToken = context.auth.idTokenPayload
      setLiffState({
        ...liffState,
        name: decodedIdToken?.name ?? null,
        email: decodedIdToken?.email ?? null,
        picture: (decodedIdToken?.picture as string) ?? null
      })
    }
  }, [context.auth?.idTokenPayload])
```
把一個流程串起來看
```javascript
// MainPage
onLoginBtnClick(hook.doLogin())
// authHook
doLogin = useCallback(async() => {context.login()}, [context.inited])
// authContext
login = async () => {api().then((result) => {
    const { success, accessToken, errmessage } = result
    setAuth({
        ...auth,
        accessToken,
        errmessage
    })
})}
// authHook
const isLoggedIn = useMemo(() => context.accessToken !== null, [context.accessToken])
// MainPage
if (hook.isLoggedIn) {
    return <LoginForm />
} else {
    return <Content />
}
```
與之相對，直覺一點的寫法(至少是幾年前我出社會的時候接觸的)
```javascript
// LoginPage
onLoginBtnClick(doLogin())
doLogin = async() => {
    api().then((result) => {
        const { success, accessToken, errmessage } = result
        if (success) {
            authContext.accessToken = accessToken
            showMainPage(authContext)
        } else {
            $(domErrmessage).html(errmessage)
            $(domErrMessage).show()
        }
    })
}
// MainPage
if (authContext.isLoggedIn()) {
    ...
} else {
    //backToLogin
}
```
最大的不同應該在React的各部分元件，只透過hook或者context，關注它們需要反應的資料 vs 傳統的Page需要持有並認識所有的子/父甚至兄弟元件，在更新資料後一個個assign新的值。我知道也有框架用IoC等模式去優化這個問題，雙向綁定也很好，就只是ReactJS採取了單向資料流而已，模式沒甚麼絕對的優劣，熟悉它的特性就好。比如說到pub/sub，單向資料流一定比IoC或雙向綁定的框架更適合，但如果遇到一定要pub/sub的場景，它們也一定有解決方案。

> 需求其實跟技術選型息息相關，真的不要怪工程師:「早說，你為何不早說」

[^1]:[事件風暴-領域建模](https://www.slideshare.net/slideshow/ss-125442613/125442613#40)