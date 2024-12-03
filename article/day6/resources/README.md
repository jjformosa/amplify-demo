## 回顧
前一篇我們的困境是:
1. Exteranl Provdier完成註冊後，跟SDK/手動註冊的體系不同帳號
2. 如果先完成Exteranl Provdier註冊，需要以username才能分辨帳號
3. 但我們沒辦法組織所有的username的可能，再一個個打SignIn測試，舉例來說，若使用者之前是用FB登入，實際的識別需要用fb_${fb_sub}，雖然使用者使用google登入的時候，我們也可以用fb_的prefix去搜尋，但是這時候沒有fb_sub可填。
4. 如果找不到Username，challenge沒辦法取得attributes跟clientmeta，所以我們也沒辦法從前端提供參數給trigger使用。

其實認真說只有4.是問題就是了，所以眼下我們有三個解法
1. 雖然challenge無法使用client的參數，但終究會有登入失敗，還是可以在lambda trigger throw 特定的exception message讓前端知道下一步需要註冊。
2. 另外開一個API，登入前先用adminListUser掃帳號，再決定下一步。但安全地使用Amplify客製化的API，我打算後面章節再說明，已經很熟係的人可以考慮優先這樣處理。但有另一個隱患是，Cognito都已經特地隱藏帳號不存在了，又去開這支API感覺有點破壞設計原則。
3. 實作preSign和confirmPost，接走External Provider的處理。
