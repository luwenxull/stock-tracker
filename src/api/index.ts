import API from './API';

function r<T extends typeof API, U extends InstanceType<T>>(api: T) {
  let results: string[] = [];
  let json = localStorage.getItem(api.path);
  try {
    if (json !== null) {
      results = JSON.parse(json);
    }
  } catch (e) {}
  return Promise.resolve(results.reduce((acc: U[], _) => {
    const json = localStorage.getItem(_)
    if (json !== null) {
      try {
        acc.push(api.decode(JSON.parse(json)) as U)
      } catch (e) {
      }
    } 
    return acc
  }, []))
}

function c<T extends typeof API, U extends InstanceType<T>>(api: T, item: U) {
  let results: string[] = [];
  let json = localStorage.getItem(api.path);
  try {
    if (json !== null) {
      results = JSON.parse(json);
    }
  } catch (e) {}
  results.push(item.code);
  localStorage.setItem(api.path, JSON.stringify(results));
  localStorage.setItem(item.code, JSON.stringify(item));
  return Promise.resolve(item);
}

function u<T extends typeof API, U extends InstanceType<T>>(api: T, item: U) {
  localStorage.setItem(item.code, JSON.stringify(item))
  return Promise.resolve(item)
}

export const net = {
  r,
  c,
  u,
}

export * from './stock'
