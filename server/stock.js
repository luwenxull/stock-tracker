"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
// import path from 'path';
const handler = {
    get: {
        '/stock/:id': function (req, res, params) {
            if (params.id) {
                fs_1.default.readFile(`server/data/${params.id}.json`, (err, data) => {
                    res.end(data);
                });
            }
            else {
                fs_1.default.readFile('server/data/stock.json', (err, data) => {
                    const stocks = JSON.parse(data.toString());
                    const results = [];
                    for (const path of stocks) {
                        fs_1.default.readFile(`server/data/${path}.json`, (err, data) => {
                            results.push(data.toString());
                            if (results.length === stocks.length) {
                                res.end(`[${results.toString()}]`);
                            }
                        });
                    }
                });
            }
        },
    },
    post: {
        '/stock/:id': function (req, res, params) {
            fs_1.default.readFile('server/data/stock.json', (err, data) => {
                const stocks = JSON.parse(data.toString());
                if (stocks.indexOf(params.id) === -1) {
                    stocks.push(params.id);
                    req.pipe(fs_1.default.createWriteStream(`server/data/${params.id}.json`)).on('finish', () => {
                        fs_1.default.writeFile('server/data/stock.json', JSON.stringify(stocks), () => {
                            res.end();
                        });
                    });
                }
            });
        },
    },
    put: {
        '/stock/:id': function (req, res, params) {
            req.pipe(fs_1.default.createWriteStream(`server/data/${params.id}.json`)).on('finish', () => {
                res.end();
            });
        },
    },
};
exports.default = handler;
