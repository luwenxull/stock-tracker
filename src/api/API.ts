export default abstract class API {
  static path: string;
  // public abstract _id: number
  // public abstract name: string
  // public abstract code: string
  constructor(public name: string, public code: string) {}

  static decode(data: unknown): API {
    throw Error("必须实现该方法");
  }
}
