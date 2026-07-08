import { createHash, randomBytes } from 'crypto';

export function createPrivateSeed(): string {
  return randomBytes(32).toString('hex');
}

export function hashSeed(seed: string): string {
  return createHash('sha256').update(seed).digest('hex');
}

export class SeededRng {
  private counter = 0;
  private buffer = Buffer.alloc(0);
  private offset = 0;

  constructor(private readonly seed: string) {}

  private refill() {
    this.buffer = createHash('sha256')
      .update(`${this.seed}:${this.counter}`)
      .digest();

    this.counter += 1;
    this.offset = 0;
  }

  nextUint32(): number {
    if (this.offset + 4 > this.buffer.length) {
      this.refill();
    }

    const value = this.buffer.readUInt32BE(this.offset);
    this.offset += 4;

    return value;
  }

  nextInt(maxExclusive: number): number {
    if (maxExclusive <= 0) {
      throw new Error('maxExclusive must be positive');
    }

    return this.nextUint32() % maxExclusive;
  }
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  const rng = new SeededRng(seed);
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = rng.nextInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}
