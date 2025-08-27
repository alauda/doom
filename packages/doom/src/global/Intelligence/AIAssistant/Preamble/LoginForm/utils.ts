import { JSEncrypt } from 'jsencrypt'

import type { PasswordPubKey } from './types.js'

export const crypto = (pubkey: string, encryptString: string) => {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(pubkey)
  return encrypt.encrypt(encryptString) as string
}

export const cryptoPassword = (
  { pubkey, ts }: PasswordPubKey,
  password: string,
) => crypto(pubkey, JSON.stringify({ ts, password }))
