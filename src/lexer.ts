import { InputReader } from './reader'

/** The state of the lexer */
export enum LexerState {
  /** Default state, reading words */
  default,
  /** In phrase mode, reading characters until quote terminator */
  inPhrase,
}

/** The type of token */
export enum LexerToken {
  /** A group token, either ( or ) */
  group = 'group',
  /** An operator token, either and, or, | or & (case-insensitive) */
  operator = 'operator',
  /** A word token, a sequence of alphanumeric characters */
  word = 'word',
  /** A quote token, either ' or " */
  quote = 'quote',
  /** A whitespace token, a sequence of whitespace characters */
  whitespace = 'whitespace',
}

/** A token value */
export interface LexerTokenValue {
  /** The value of the token */
  value: string
  /** The type of the token */
  token: LexerToken
}

/** A lexer interface */
export abstract class ILexer {
  /** Peek at the next {n} token(s) */
  public abstract peek(amount?: number): LexerTokenValue | null
  /** Consume the next {n} token(s) */
  public abstract consume(amount?: number): LexerTokenValue | null
  /** Check if the lexer is at the end of the input */
  public abstract isEOF(): boolean
  /** Parse the input into tokens */
  public abstract parse(): LexerTokenValue[]
  /** Set the index of the lexer */
  public abstract setIndex(n: number): void
  /** Set the index of the lexer */
  public abstract index: number
  /** The index of the next token */
  public peekIndex: number = 0
}

/** The default lexer */
export class Lexer implements ILexer {
  #reader: InputReader<string>
  #state: LexerState = LexerState.default
  #quoteTerminator: string | null = null
  public index: number = 0
  public peekIndex: number = 0
  #afterWhitespace: boolean = false
  #cache: LexerTokenValue[] = []

  constructor(reader: InputReader<string>) {
    this.#reader = reader
  }

  public peek(amount = 0): LexerTokenValue | null {
    const cacheIndex = this.index + amount

    if (this.#cache[cacheIndex]) {
      return this.#cache[cacheIndex]
    }
    if (this.isEOF()) {
      return null
    }

    this.fillCache(cacheIndex)
    const token = this.#cache[cacheIndex]

    return token
  }

  public consume(amount = 0): LexerTokenValue | null {
    const cacheIndex = this.index + amount
    this.index = cacheIndex + 1

    if (this.#cache[cacheIndex]) {
      return this.#cache[cacheIndex]
    }
    if (this.isEOF()) {
      return null
    }

    this.fillCache(cacheIndex)
    const token = this.#cache[cacheIndex]
    return token
  }

  private fillCache(n: number) {
    const { index } = this
    for (let i = 0; i <= n; i++) {
      this.index = i
      if (this.isEOF()) {
        return
      }
      if (this.#cache[i]) {
        continue
      }
      const value = this.readNextToken()
      this.#cache[i] = value!
    }
    this.index = index
  }

  public parse(): LexerTokenValue[] {
    const tokens: LexerTokenValue[] = []
    while (!this.isEOF()) {
      tokens.push(this.consume()!)
    }
    return tokens
  }

  public setIndex(n: number): void {
    this.index = n
  }

  public isEOF(): boolean {
    return this.#reader.isEOF()
  }

  private readNextToken(): LexerTokenValue | null {
    const nextChar = this.#reader.peek()
    switch (this.#state) {
      case LexerState.default:
        // whitespace
        if (this.isWhitespace(nextChar)) {
          return this.consumeWhitespace()
        }

        // quote
        if (`"'`.includes(nextChar)) {
          this.#state = LexerState.inPhrase
          this.#quoteTerminator = nextChar
          return this.consumeQuote()
        }

        // other words
        if (this.isAlphanumeric(nextChar)) {
          // guard OR
          if (this.#afterWhitespace && this.peekExact('OR')) {
            return this.consumeOr()
          }
          // guard AND
          if (this.#afterWhitespace && this.peekExact('AND')) {
            return this.consumeAnd()
          }

          // neither, consume normally
          return this.consumeWord()
        }

        // or operator
        if (nextChar === '|') {
          return this.consumeOr()
        }

        // and operator
        if (nextChar === '&') {
          return this.consumeAnd()
        }

        // group
        if (nextChar === '(' || nextChar === ')') {
          return this.consumeGroup()
        }

        // other, consider as whitespace
        return this.consumeWhitespace()
      case LexerState.inPhrase:
        this.#afterWhitespace = false

        // in phrase mode, consume until quote terminator
        if (nextChar === this.#quoteTerminator) {
          this.#state = LexerState.default
          return this.consumeQuote()
        }

        // otherwise consume any character
        return this.consumePhrase()
      default:
        throw new Error('bad state')
    }
  }

  private consumeWhitespace() {
    this.#afterWhitespace = true
    return {
      value: this.#reader.consume(),
      token: LexerToken.whitespace,
    }
  }

  private consumeQuote(): LexerTokenValue {
    return {
      value: this.#reader.consume(),
      token: LexerToken.quote,
    }
  }

  private consumeAnd(): LexerTokenValue {
    let value = ''
    if (this.peekExact('AND')) {
      this.consumeExact('AND')
      value = 'and'
    } else if (this.peekExact('&')) {
      this.consumeExact('&')
      value = '&'
    }
    return {
      value,
      token: LexerToken.operator,
    }
  }

  private consumeOr(): LexerTokenValue {
    let value = ''
    if (this.peekExact('OR')) {
      this.consumeExact('OR')
      value = 'or'
    } else if (this.peekExact('|')) {
      this.consumeExact('|')
      value = '|'
    }
    return {
      value,
      token: LexerToken.operator,
    }
  }

  private peekExact(word: string) {
    let nextChar = this.#reader.peek()
    for (let i = 0; i < word.length; i++) {
      if (nextChar !== word[i]) {
        return false
      }
      nextChar = this.#reader.peek(i + 1)
    }
    return true
  }

  private consumeExact(word: string) {
    if (this.peekExact(word)) {
      this.consumeLength(word.length)
    } else {
      throw new Error("Can't find exact word: " + word)
    }
  }

  private consumeLength(times = 1) {
    for (let i = 0; i < times; i++) {
      this.#reader.consume()
    }
  }

  private consumeGroup(): LexerTokenValue {
    return {
      value: this.#reader.consume(),
      token: LexerToken.group,
    }
  }

  private consumePhrase(): LexerTokenValue {
    let nextChar = this.#reader.consume()
    let value = nextChar
    while ((nextChar = this.#reader.peek()) && nextChar !== this.#quoteTerminator) {
      value += this.#reader.consume()
    }
    return {
      value,
      token: LexerToken.word,
    }
  }

  private consumeWord(): LexerTokenValue {
    let value = this.consumeWholeWord()
    return {
      value,
      token: LexerToken.word,
    }
  }

  private consumeWholeWord() {
    let value = ''
    while (this.isAlphanumeric(this.#reader.peek())) {
      value += this.#reader.consume()
    }
    return value
  }

  private isWhitespace(char: string) {
    return ' \t\n\r'.includes(char)
  }

  private isAlphanumeric(char: string): boolean {
    return /^(\w|\d|[-_])$/.test(char)

    // return char.length > 0 && 'abcdefghijklmnopqrstuvwxyz0123456789-_'.includes(char.toLowerCase())

    // const charCode = char.charCodeAt(0)
    // return (
    //   (charCode >= 48 && charCode <= 57) ||
    //   (charCode >= 65 && charCode <= 90) ||
    //   (charCode >= 97 && charCode <= 122)
    // )
  }
}
