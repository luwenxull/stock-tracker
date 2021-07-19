// const http = require('http');
import http, { IncomingMessage, ServerResponse } from 'http';

let port = 3001; // local port
let staticTarget = 'localhost',
  staticTargetPort = '3000';

process.argv.forEach((param, i) => {
  if (param === '-p' || param === '--port') {
    port = parseInt(process.argv[i + 1]);
  }
  if (param === '-st' || param === '--static-target') {
    staticTarget = process.argv[i + 1];
  }
  if (param === '-stp' || param === '--static-target-port') {
    staticTargetPort = process.argv[i + 1];
  }
});

console.log(`server started at: http://localhost:${port}`);
http.createServer(onRequest).listen(port);

function onRequest(client_req: IncomingMessage, client_res: ServerResponse) {
  console.log('serve: ' + client_req.url);

  var options = {
    hostname: staticTarget,
    port: staticTargetPort,
    path: client_req.url,
    method: client_req.method,
    headers: client_req.headers,
  };

  if (client_req.url?.startsWith('/api')) {
  }

  var proxy = http.request(options, function (res) {
    client_res.writeHead(res.statusCode, res.headers);
    res.pipe(client_res, {
      end: true,
    });
  });

  proxy.on('error', e => {
    console.error(e.message);
  });

  client_req.pipe(proxy, {
    end: true,
  });
}
