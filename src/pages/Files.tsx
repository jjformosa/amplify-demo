import { useCallback, useEffect } from "react";
import { useLiff } from "@src/hook/line/useLiff";
import { useAmplifyAuth } from "@src/hook/amplify";
import { useNavigate } from 'react-router-dom';
import { FileList, UploadFileInput } from "@src/component/Files";

export const FilesPage = () => {
  const $navigate = useNavigate();
  const $liff = useLiff();
  const $amplifyAuth = useAmplifyAuth();

  const _loginWithLiff = useCallback(async () => {
    if ($liff.isLoggedIn && !$amplifyAuth.isLoggedIn) {
      const accesstoken = $liff.accessToken!;
      const idToken = $liff.idToken!;
      await $amplifyAuth.doLogin('liff', { accesstoken, idToken })
    }
  }, [$liff.isLoggedIn])

  useEffect(() => {
    if(!$amplifyAuth.accessToken) return
    const profile = $amplifyAuth.getProfile()
    if (!profile) {
      console.error('aws login fail')
    } else {
      console.log('aws login success')
    }
  }, [$amplifyAuth.accessToken])

  useEffect(() => {
    if(!$liff.inited) return
    if(!$liff.isLoggedIn) {
      $navigate('/login')
    } else {
      _loginWithLiff()
      // $liff.doLogout()
    }
  }, [$liff.inited, $liff.isLoggedIn])

  if ($amplifyAuth.isLoggedIn) {
    return (
      <>
        <UploadFileInput directName="personal" uId={$amplifyAuth.userName!}  />
        <FileList directName="personal" uId={$amplifyAuth.userName!} />
      </>
    );
  }
};