import fs from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import { IMapper } from '.';
// import path from 'path';
const handler: Partial<IMapper> = {
  get: {
    '/stock/:id': function (
      req: IncomingMessage,
      res: ServerResponse,
      params: {
        id?: string;
      }
    ) {
      if (params.id) {
        fs.readFile(`server/data/${params.id}.json`, (err, data) => {
          res.end(data);
        });
      } else {
        fs.readFile('server/data/stock.json', (err, data) => {
          const stocks: any[] = JSON.parse(data.toString());
          const results: any = [];
          for (const path of stocks) {
            fs.readFile(`server/data/${path}.json`, (err, data) => {
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
    '/stock/:id': function (
      req: IncomingMessage,
      res: ServerResponse,
      params: {
        id?: string;
      }
    ) {
      fs.readFile('server/data/stock.json', (err, data) => {
        const stocks: any[] = JSON.parse(data.toString());
        if (stocks.indexOf(params.id) === -1) {
          stocks.push(params.id);
          req.pipe(fs.createWriteStream(`server/data/${params.id}.json`)).on('finish', () => {
            fs.writeFile('server/data/stock.json', JSON.stringify(stocks), () => {
              res.end();
            });
          });
        }
      });
    },
  },
  put: {
    '/stock/:id': function (
      req: IncomingMessage,
      res: ServerResponse,
      params: {
        id?: string;
      }
    ) {
      req.pipe(fs.createWriteStream(`server/data/${params.id}.json`)).on('finish', () => {
        res.end();
      });
    },
  },
};

export default handler;
