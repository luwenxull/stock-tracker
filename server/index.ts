// const http = require('http');
import http, { IncomingMessage, ServerResponse } from 'http';
// import fs from 'fs';
// @ts-ignore
import statik from 'node-static';
import stock from './stock';

interface IRequestHandler {
  [p: string]: (req: IncomingMessage, res: ServerResponse, params: any) => void;
}

export interface IMapper {
  [p: string]: IRequestHandler;
}

const mapper: IMapper = {
  get: {},
  post: {},
  put: {},
};

function map(data: Partial<IMapper>) {
  Object.assign(mapper, data);
}

map(stock);

const file = new statik.Server('./build');

let port = 3001; // local port
let dev = false;

process.argv.forEach((param, i) => {
  if (param === '--dev') {
    dev = true;
  }
});

console.log(`server started at: http://localhost:${port}`);
http.createServer(onRequest).listen(port);

function onRequest(req: IncomingMessage, res: ServerResponse) {
  console.log('serve: ' + req.url);
  if (req.url !== undefined) {
    if (req.url.startsWith('/api')) {
      if (req.method && mapper[req.method.toLowerCase()]) {
        const handlers = mapper[req.method.toLowerCase()];
        for (const k of Object.keys(handlers)) {
          let params = testUrl(req.url.slice(4), k);
          if (params) {
            handlers[k](req, res, params);
          }
        }
      }
    } else {
      if (dev) {
        const client_res = res;
        const proxy = http.request(
          {
            hostname: 'localhost',
            port: 3000,
            path: req.url,
            method: req.method,
            headers: req.headers,
          },
          res => {
            client_res.writeHead(res.statusCode as number, res.headers);
            res.pipe(client_res, {
              end: true,
            });
          }
        );
        req.pipe(proxy, {
          end: true,
        });
      } else {
        if (req.url === '/') {
          file.serveFile('index.html', 200, {}, req, res);
        } else {
          file.serve(req, res);
        }
      }
    }
  }
}

function testUrl(url: string, def: string): boolean | { [p: string]: string } {
  const pending = def.split('/'),
    params: { [p: string]: string } = {},
    ps = url.split('/');
  if (ps.length === pending.length || ps.length === pending.length - 1) {
    for (const [i, v] of ps.entries()) {
      if (pending[i][0] === ':') {
        params[pending[i].slice(1)] = v;
      } else if (pending[i] === v) {
        continue;
      } else {
        return false;
      }
    }
    return params;
  } else {
    return false;
  }
}
