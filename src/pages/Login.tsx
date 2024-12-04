import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { LineLoginBtn } from "@src/component/LineLoginBtn";
import { useCurrentUrl } from "@src/hook/useCurrentUrl";
import { useLiff } from "@src/hook/line/useLiff";
import { useAmplifyAuth } from "@src/hook/amplify";


export const Login = () => {
  const $liff = useLiff();
  const $amplifyAuth = useAmplifyAuth();
  const $currentUrl = useCurrentUrl();
  const $navigate = useNavigate();

  useEffect(() => {
    if ($amplifyAuth.isLoggedIn) $navigate('/');
  }, [$amplifyAuth.isLoggedIn])

  useEffect(() => {
    if ($liff.isLoggedIn) {
      if (!$amplifyAuth.isLoggedIn) {
         $navigate('/')
      } else {
        // TODO loading block
        try {
          const accesstoken = $liff.accessToken!;
          const idToken = $liff.idToken!;
          $amplifyAuth.doLogin('liff', { accesstoken, idToken });
        } catch(e) {
          console.error(`liff error: idToken or accesstoken is null`);
        }
      //   $amplifyAuth.doLogout().then(() => {
      //     console.log('logout success')
      //   })
      // }
    }}
  }, [$liff.accessToken, $liff.idToken])

  if (!$liff.isLoggedIn) {
    return (
      <div className="p-4">
        <LineLoginBtn redirectUri = {$currentUrl.host}></LineLoginBtn>
      </div>
    );
  } else {
    return (
      <div className="p-4">
        Liff LoggedIn!!!!
      </div>
    );
  }
};