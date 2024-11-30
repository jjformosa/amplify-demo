import { useLiff } from "@src/hook/line/useLiff";

type LoginInput = { redirectUri?: string }

export const LineLoginBtn = ({ redirectUri }: LoginInput) => {
  const $liff = useLiff(); // hook

  const login = () => {
    $liff.doLogin(redirectUri ?? window.location.href);
  }

  if($liff.inited && !$liff.isLoggedIn) {
    return (
      <>
          <button onClick={ login }>Login</button>
      </>
    )
  } else {
    return (<div>loggedIn!!!!!</div>)
  }
}