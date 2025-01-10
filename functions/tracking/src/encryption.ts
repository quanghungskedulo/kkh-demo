import * as crypto from 'crypto';
import { parse } from 'qs'

export interface RequestProps {
  jobId: string,
  resourceIds: string
  expiry: string,
}


export class Encrypt {
  private algorithm = 'aes-256-cbc';
  public key: string
  public iv: string

  public constructor(key: string, iv: string) {
    this.key = key;
    this.iv = iv;
  }

  public encrypt = (text: string) => {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  public decrypt = (encryptedText: string) => {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }

  public handleToken = (querystring: string | undefined | null): RequestProps => {

    if (!querystring) { throw new Error("token is required") }
  
    const parsed = parse(querystring);
  
    if(!parsed.token && typeof parsed.token == 'string') { throw new Error("token is required") }
  
    const requestProps = JSON.parse(this.decrypt(parsed.token as string)) as RequestProps
  
    if(Date.parse(requestProps.expiry) < Date.now()) {
       throw new Error("token is expired")
    }
  
    return requestProps
  
  }

}