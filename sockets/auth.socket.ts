import { Socket } from "socket.io"
// @ts-expect-error cookie's package exports require node16/nodenext/bundler resolution.
import * as cookie from 'cookie';
import jwt, { JwtPayload } from "jsonwebtoken";

export const authSocket = (socket: Socket, next: any) => {
 try {
  const cookieString = socket.handshake.headers.cookie
  if(cookieString){
    const cookieParse = cookie.parseCookie(cookieString);
    let token: string = ""
    let role: string =""
    if(cookieParse.tokenAdmin){
      token = cookieParse.tokenAdmin
      role= "admin"
    }else if(cookieParse.tokenUser){
      token = cookieParse.tokenUser
      role= "user"
    }
    if(token && role){
      const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`) as JwtPayload
      if(decoded && decoded.id && decoded.email) {
      socket.data.account= {
        id: decoded.id,
        email: decoded.email,
        role: role
       }
      }
    }
  }
  next()
 } catch (error) {
  console.log(error)
 }
}