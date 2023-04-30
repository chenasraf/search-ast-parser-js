/**
 * Abstract Input Reader
 */
export abstract class InputReader<T> {
  /** Peek at the next character in the input stream */
  public abstract peek(n?: number): T
  /** Consume the next character in the input stream */
  public abstract consume(n?: number): T
  /** Set the index of the input stream */
  public abstract setIndex(n: number): void
  /** Check if the input stream is at the end of the file */
  public abstract isEOF(): boolean
  /** The current index of the input stream */
  public index!: number
}

/**
 * Buffer Input Reader
 */
export class BufferReader implements InputReader<string> {
  #buffer: Buffer
  public index: number

  constructor(buffer: Buffer) {
    this.#buffer = buffer
    this.index = 0
  }

  public peek(n = 0): string {
    return this.#buffer.subarray(this.index + n, 1).toString()
  }

  public consume(n = 0): string {
    const result = this.#buffer.subarray(this.index + n, 1).toString()
    this.index++
    return result
  }

  public setIndex(n: number): void {
    this.index = n
  }

  public isEOF(): boolean {
    return this.index >= this.#buffer.length
  }
}

/**
 * String Input Reader
 */
export class StringReader implements InputReader<string> {
  #string: string
  public index: number = 0

  constructor(string: string) {
    this.#string = string
  }

  public peek(n = 0): string {
    return this.#string.substring(this.index + n, this.index + n + 1)
  }

  public consume(n = 0): string {
    const result = this.#string.substring(this.index + n, this.index + n + 1)
    this.index++
    return result
  }

  public setIndex(n: number): void {
    this.index = n
  }

  public isEOF(): boolean {
    return this.index >= this.#string.length
  }
}
