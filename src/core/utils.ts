
export function truncate(str: string, length: number): string {
  return str.length <= length ? str : str.slice(0, length) + '...';
}

export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
