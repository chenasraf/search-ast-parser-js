export abstract class InputReader<T> {
  public abstract peek(n?: number): T
  public abstract consume(n?: number): T
  public abstract setIndex(n: number): void
  public abstract isEOF(): boolean
  public index!: number
}

export class BufferReader implements InputReader<string> {
  private buffer: Buffer
  public index: number

  constructor(buffer: Buffer) {
    this.buffer = buffer
    this.index = 0
  }

  public peek(n = 0): string {
    return this.buffer.subarray(this.index + n, 1).toString()
  }

  public consume(n = 0): string {
    const result = this.buffer.subarray(this.index + n, 1).toString()
    this.index++
    return result
  }

  public setIndex(n: number): void {
    this.index = n
  }

  public isEOF(): boolean {
    return this.index >= this.buffer.length
  }
}

export class StringReader implements InputReader<string> {
  private string: string
  public index: number = 0

  constructor(string: string) {
    this.string = string
  }

  public peek(n = 0): string {
    return this.string.substring(this.index + n, this.index + n + 1)
  }

  public consume(n = 0): string {
    const result = this.string.substring(this.index + n, this.index + n + 1)
    this.index++
    return result
  }

  public setIndex(n: number): void {
    this.index = n
  }

  public isEOF(): boolean {
    return this.index >= this.string.length
  }
}
