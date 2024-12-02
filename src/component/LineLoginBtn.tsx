import { useLiff } from "@src/hook/line/useLiff";

type LoginInput = { redirectUri?: string }

export const LineLoginBtn = ({ redirectUri }: LoginInput) => {
  const $liff = useLiff(); // hook

  const login = () => {
    $liff.doLogin(redirectUri ?? window.location.href);
  }

  if($liff.isLoggedIn) {
    return (<div>loggedIn!!!!!</div>)
  } else {
    return (
      <>
          <button onClick={ login }>Login</button>
      </>
    )
  }
}