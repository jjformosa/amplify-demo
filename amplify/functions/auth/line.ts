import axios from 'axios'
import crypto from 'crypto'

export type IdentitySource = 'email' | 'liff' | 'lineLogin' | 'google' | 'facebook'

export type PayloadWithLiff = {
  email: string,
  name: string,
  picture: string,
  sub: string,
  iss: string,
  aud: string
}

export type SignUpInputWithLiff = {
  clientId: string,
  email: string,
  name: string,
  picture: string,
  accesstoken: string
}

export const verifyIdTokenWithLiff = async function (id_token: string, client_info: { email: string }): Promise<boolean> {
  const client_id = process.env.LIFF_CLIENT_ID
  const liffSecrect = process.env.LIFF_CLIENT_SECRECT
  console.log(`liff param: ${client_id}, ${liffSecrect}`)
  if (!client_id || !liffSecrect) return Promise.reject(false)

  const expect_nonce = crypto.randomBytes(16).toString('base64')
  const verifyResponse = await axios.post('https://api.line.me/oauth2/v2.1/verify', {
    id_token,
    client_id,
    nonce:expect_nonce
  }, {
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  })
  if (verifyResponse.status === 200) {
    const { nonce, email } = verifyResponse.data
    if (nonce === expect_nonce && email === client_info.email) {
      return true
    }
  }
  return false
}

export const verifyAccessTokenWithLiff = async function (access_token: string): Promise<[boolean, string]> {
  const client_id = process.env.LINE_ID
  if (!client_id) return [false, 'liff client_id need']

  const verifyResponse = await axios.get('https://api.line.me/oauth2/v2.1/verify', {
    params: {
      access_token,
      client_id
    }
  })
  if (verifyResponse.status === 200) {
    // if (verifyResponse.data.expires_in > 0)  // 如果到期，line會回應400
    return [true, '']
  } else if (verifyResponse.status === 400) {
    return [false, verifyResponse.data.error_description]
  }
  return [false, 'line login api fail']
}