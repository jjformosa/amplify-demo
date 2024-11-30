// import { LineLoginBtn } from "@src/component/LineLoginBtn";
// import { useCurrentUrl } from "@src/hook/useCurrentUrl";
import { useCallback, useMemo } from "react";
import { signInWithRedirect } from "aws-amplify/auth";
import { useLiff } from "@src/hook/line/useLiff";


export const Login = () => {
  const $liff = useLiff()
  // const $currentUrl = useCurrentUrl();

  const doLogin = useCallback(() => {
    // signInWithRedirect()
    $liff.doLogin()
  }, [])
  if ($liff.isLoggedIn) {
    return <div>{ $liff.auth?.idToken }</div>
  } else {
    return (
      <div className="p-4">
        {/* <LineLoginBtn redirectUri = {$currentUrl.host}></LineLoginBtn> */}
        <button onClick={doLogin}>Login</button>
      </div>
    );
  }
};