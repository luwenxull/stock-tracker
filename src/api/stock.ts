import API from './API';
import { num } from '../util';

export interface IStockExit {
  price: number;
  share: number;
  profit: number;
}

export interface IStockEntry {
  share: number;
  price: number;
  floatingProfit?: number;
  exits?: IStockExit[];
}

export interface IStockGlanceResult {
  floatingProfit: number;
  share: number;
  money: number;
  ratio: number;
  costPrice: number;
}

export class Stock extends API {
  public entries: IStockEntry[] = [];
  public realtimePrice?: number;
  public lastPrice?: number;
  public rise?: string;
  // public exits: IStockEntry[] = [];
  public glance: IStockGlanceResult = {
    floatingProfit: 0,
    share: 0,
    ratio: 0,
    money: 0,
    costPrice: 0,
  };

  private makeGlance() {
    if (this.realtimePrice !== undefined) {
      let floatingProfit = 0,
        share = 0;
      for (let _ of this.entries) {
        _.floatingProfit = Number(((this.realtimePrice - _.price) * _.share).toFixed(2));
        floatingProfit += _.floatingProfit;
        // 已清仓份额
        floatingProfit += (_.exits || []).reduce((a, e) => a + e.profit, 0);
        share += _.share;
      }
      let money = Number((this.realtimePrice * share).toFixed(2));
      this.glance = {
        floatingProfit,
        share,
        money,
        ratio: num(((floatingProfit / money) * 100).toFixed(2)),
        costPrice: num(((money - floatingProfit) / share).toFixed(3)),
      };
    }
    return this;
  }

  public clear() {
    this.entries = [];
    this.glance = {
      floatingProfit: 0,
      share: 0,
      ratio: 0,
      money: 0,
      costPrice: 0,
    };
  }

  // call this first
  public setRealtimePrice() {
    return new Promise(resolve => {
      // 雪球
      // fetch(`https://stock.xueqiu.com/v5/stock/quote.json?symbol=SH512880`)
      let script = document.createElement('script');
      script.src = `https://hq.sinajs.cn/list=${this.code.toLowerCase()}`;
      script.onload = () => {
        const values = (window as any)[`hq_str_${this.code.toLowerCase()}`].split(',');
        script.remove();
        this.realtimePrice = values[3];
        this.lastPrice = values[2];
        this.rise = (((values[3] - values[2]) / values[2]) * 100).toFixed(2) + '%';
        this.makeGlance();
        resolve(this);
      };
      document.head.append(script);
    });
  }

  public enter(price: number, share: number) {
    this.entries.push({
      price,
      share,
      exits: [],
    });
    this.entries = this.entries.sort((a, b) => a.price - b.price);
    return this.makeGlance();
  }

  public exit(price: number, share: number) {
    for (let _ of this.entries) {
      if (!_.exits) {
        _.exits = [];
      }
      if (_.share >= share) {
        _.share -= share;
        _.exits.push({
          price,
          share,
          profit: Number(((price - _.price) * share).toFixed(2)),
        });
        break;
      } else if (_.share > 0) {
        _.exits.push({
          price,
          share: _.share,
          profit: Number(((price - _.price) * _.share).toFixed(2)),
        });
        share -= _.share;
        _.share = 0;
      }
    }
    return this.makeGlance();
  }

  static path = '/stock';

  static decode(item: Stock) {
    return Object.assign(new Stock('', ''), item);
  }
}
