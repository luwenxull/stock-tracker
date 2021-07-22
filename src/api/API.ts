// type Params<T> = T extends API<infer U> ? U : never;

type APIParams = {
  [p: string]: string | number;
};

function interpolateParams(url: string, params: APIParams) {
  for (const k of Object.keys(params)) {
    url = url.replace(`:${k}`, String(params[k]));
  }
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
}

function r(path: string, params: APIParams) {
  return fetch(interpolateParams(path, params)).then(res => res.json());
}

function c<U>(path: string, params: APIParams, data: U) {
  return fetch(interpolateParams(path, params), {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

function u<U>(path: string, params: APIParams, data: U) {
  return fetch(interpolateParams(path, params), {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export default abstract class API<T extends APIParams, U> {
  public path: string = '';
  constructor(public code: string) {}

  public abstract decode(data: U): API<T, U>;

  public abstract encode(): U;

  public abstract defaultParams(): T;

  public r(params: T): Promise<U[]> {
    return r('/api' + this.path, params);
  }

  public c(params: T = this.defaultParams()): Promise<this> {
    return c('/api' + this.path, params, this.encode()).then(() => this);
  }

  public u(params: T = this.defaultParams()): Promise<this> {
    return u('/api' + this.path, params, this.encode()).then(() => this);
  }
}
