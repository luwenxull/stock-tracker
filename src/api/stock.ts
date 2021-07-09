import API from './API';

interface IStockExit {
  price: number;
  share: number;
  profit: number;
}

interface IStockEntry {
  share: number;
  price: number;
  floatingProfit?: number;
  exits?: IStockExit[];
}

interface IStockGlanceResult {
  floatingProfit: number,
  share: number,
  money: number,
  ratio: number,
  costPrice: number,
}

export class Stock extends API {
  public entries: IStockEntry[] = [];
  public realtimePrice?: number;
  // public exits: IStockEntry[] = [];
  public glance: IStockGlanceResult = {
    floatingProfit: 0,
    share: 0,
    ratio: 0,
    money: 0,
    costPrice: 0,
  }

  private makeGlance() {
    if (this.realtimePrice !== undefined) {
      let floatingProfit = 0,
        share = 0;
        for (let _ of this.entries) {
          _.floatingProfit =
            (_.exits || []).reduce((a, e) => a + e.profit, 0) +
            Number(((this.realtimePrice - _.price) * _.share).toFixed(2));
          floatingProfit += _.floatingProfit;
          share += _.share;
        }
      let money = Number((this.realtimePrice * share).toFixed(2));
      this.glance = {
        floatingProfit,
        share,
        money,
        ratio: Number((floatingProfit / money * 100).toFixed(2)),
        costPrice: Number(((money - floatingProfit ) / share).toFixed(3)),
      };
    } 
    return this
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
        const price = values[3];
        script.remove();
        this.realtimePrice = price;
        this.makeGlance()
        resolve(price);
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
    return this.makeGlance()
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
    return this.makeGlance()
  }


  static path = '/stock';

  static decode(item: Stock) {
    return Object.assign(new Stock('', ''), item);
  }
}
