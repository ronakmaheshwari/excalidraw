import { WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"
import { ApiError } from '@repo/logger/error';
import { logError } from '@repo/logger';
import { jwtSecret } from '@repo/common/config';

dotenv.config();

if(!jwtSecret){
    logError(500,"[WS]: JWT Secret was not provided");
    throw ApiError.internal("JWT Secret was not provided");
}

const jwtsecret = jwtSecret;

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws,request) {
  const url = request.url;

  if(!url){
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get("token");

  if(!token){
    ws.close();
    return;
  }

  let decoded: JwtPayload | null = null;
  try {
    decoded = jwt.verify(token, jwtsecret) as JwtPayload;
  } catch (err) {
    // invalid token: close the socket
    ws.close();
    return;
  }

  const user = decoded.userId;

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('pong');
});