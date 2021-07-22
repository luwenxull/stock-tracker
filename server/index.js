"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const http = require('http');
const http_1 = __importDefault(require("http"));
// import fs from 'fs';
// @ts-ignore
const node_static_1 = __importDefault(require("node-static"));
const stock_1 = __importDefault(require("./stock"));
const mapper = {
    get: {},
    post: {},
    put: {},
};
function map(data) {
    Object.assign(mapper, data);
}
map(stock_1.default);
const file = new node_static_1.default.Server('./build');
let port = 3001; // local port
let dev = false;
process.argv.forEach((param, i) => {
    if (param === '--dev') {
        dev = true;
    }
});
console.log(`server started at: http://localhost:${port}`);
http_1.default.createServer(onRequest).listen(port);
function onRequest(req, res) {
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
        }
        else {
            if (dev) {
                const client_res = res;
                const proxy = http_1.default.request({
                    hostname: 'localhost',
                    port: 3000,
                    path: req.url,
                    method: req.method,
                    headers: req.headers,
                }, res => {
                    client_res.writeHead(res.statusCode, res.headers);
                    res.pipe(client_res, {
                        end: true,
                    });
                });
                req.pipe(proxy, {
                    end: true,
                });
            }
            else {
                if (req.url === '/') {
                    file.serveFile('index.html', 200, {}, req, res);
                }
                else {
                    file.serve(req, res);
                }
            }
        }
    }
}
function testUrl(url, def) {
    const pending = def.split('/'), params = {}, ps = url.split('/');
    if (ps.length === pending.length || ps.length === pending.length - 1) {
        for (const [i, v] of ps.entries()) {
            if (pending[i][0] === ':') {
                params[pending[i].slice(1)] = v;
            }
            else if (pending[i] === v) {
                continue;
            }
            else {
                return false;
            }
        }
        return params;
    }
    else {
        return false;
    }
}
