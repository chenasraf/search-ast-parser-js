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
 * This reader is used to read from a buffer instead of a string, which is useful for reading from
 * files, or for better performance as buffer indexes are loaded lazily.
 *
 * In most cases, you would want to use the regular `parse` function, which uses a dynamic reader from the input.
 *
 * If you still want to create a buffer reader, you can do so by using the `BufferReader` class.
 *
 * @example
 * ```ts
 * const reader = new BufferReader(Buffer.from('(apple OR orange) AND (drink OR juice)'))
 * const lexer = new Lexer(reader)
 * const parser = new Parser(lexer)
 * const tokens = parser.parse()
 * ```
 */
export class BufferReader implements InputReader<string> {
  #buffer: Buffer
  public index: number

  constructor(buffer: Buffer) {
    this.#buffer = buffer
    this.index = 0
  }

  public peek(n = 0): string {
    return this.#buffer.subarray(this.index + n, this.index + n + 1).toString()
  }

  public consume(n = 0): string {
    const result = this.#buffer.subarray(this.index + n, this.index + n + 1).toString()
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
 * This reader is used to read from a string. This is usually worse for performance than reading
 * from a buffer, as buffer indexes are loaded lazily, but for most cases it is good enough.
 *
 * In most cases, you would want to use the regular `parse` function, which uses a dynamic reader
 * from the input.
 *
 * If you still want to create a string reader, you can do so by using the `StringReader` class.
 *
 * @example
 * ```ts
 * const reader = new StringReader('(apple OR orange) AND (drink OR juice)')
 * const lexer = new Lexer(reader)
 * const parser = new Parser(lexer)
 * const tokens = parser.parse()
 * ```
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
