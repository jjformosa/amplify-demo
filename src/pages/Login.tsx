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
      //   $navigate('/')
      // } else {
        // TODO loading block
        // const accesstoken = $liff.accessToken!;
        // const idToken = $liff.idToken!;
        Promise.all([$liff.getIdToken(), $liff.doGetAccessToken()])
          .then(([idToken, accesstoken]) => {
            if (!idToken || !accesstoken) throw new Error(`liff error: idToken ${idToken}, accesstoken ${accesstoken}`);
            // $amplifyAuth.doLogin('liff', { accesstoken, idToken });
            $amplifyAuth.doLogout().then(() => {
              console.log('logout success')
            });
        }).catch(e => console.error(e)) // TODO err dialog
      }
    }
  }, [$liff.isLoggedIn])

  return (
    <div className="p-4">
      <LineLoginBtn redirectUri = {$currentUrl.host}></LineLoginBtn>
    </div>
  );
};