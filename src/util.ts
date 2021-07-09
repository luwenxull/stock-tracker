export function num(val: any) {
    let n = Number(val);
    if (Number.isNaN(n)) {
      return 0
    }
    return n
  }
