import { InputReader } from './reader'

export enum TokenizerState {
  default,
  inPhrase,
}

export enum LexerToken {
  group = 'group',
  operator = 'operator',
  word = 'word',
  quote = 'quote',
  whitespace = 'whitespace',
}

export interface LexerTokenValue {
  value: string
  token: LexerToken
}

export abstract class ILexer {
  public abstract peek(): LexerTokenValue
  public abstract consume(): LexerTokenValue
  public abstract isEOF(): boolean
  public abstract parse(): LexerTokenValue[]
  public abstract index: number
  public abstract setIndex(n: number): void
}

export class Lexer implements ILexer {
  reader: InputReader<string>
  state: TokenizerState = TokenizerState.default
  quoteTerminator: string | null = null
  index: number = 0
  peekIndex: number = 0
  afterWhitespace: boolean = false

  constructor(reader: InputReader<string>) {
    this.reader = reader
  }

  // TODO implement peek by (n)?
  public peek(): LexerTokenValue {
    // save state before peeking
    const beforePeekState = this.state
    const beforePeekIndex = this.reader.index
    const beforePeekWhiteSpace = this.afterWhitespace

    const value = this.readNextToken()

    // restore state after peeking
    this.state = beforePeekState
    this.reader.setIndex(beforePeekIndex - 1)
    this.afterWhitespace = beforePeekWhiteSpace

    return value
  }

  // TODO implement consume by (n)?
  public consume(): LexerTokenValue {
    const token = this.readNextToken()
    this.index++
    return token
  }

  public parse(): LexerTokenValue[] {
    const tokens: LexerTokenValue[] = []
    while (!this.isEOF()) {
      tokens.push(this.consume())
    }
    return tokens
  }

  public setIndex(n: number): void {
    this.index = n
  }

  public isEOF(): boolean {
    return this.reader.isEOF()
  }

  private readNextToken(): LexerTokenValue {
    const nextChar = this.reader.peek()
    switch (this.state) {
      case TokenizerState.default:
        // whitespace
        if (this.isWhitespace(nextChar)) {
          this.afterWhitespace = true
          return {
            value: this.reader.consume(),
            token: LexerToken.whitespace,
          }
        }

        // quote
        if (`"'`.includes(nextChar)) {
          this.state = TokenizerState.inPhrase
          this.quoteTerminator = nextChar
          return this.consumeQuote()
        }

        // other words
        if (this.isAlphanumeric(nextChar)) {
          // guard OR
          if (this.afterWhitespace && this.peekExact('OR')) {
            return this.consumeOr()
          }
          // guard AND
          if (this.afterWhitespace && this.peekExact('AND')) {
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

        // other, consume normally
        return this.consumeWord()
      case TokenizerState.inPhrase:
        this.afterWhitespace = false

        // in phrase mode, consume until quote terminator
        if (nextChar === this.quoteTerminator) {
          this.state = TokenizerState.default
          return this.consumeQuote()
        }

        // otherwise consume any character
        return this.consumePhrase()
      default:
        throw new Error('bad state')
    }
  }

  private consumeQuote(): LexerTokenValue {
    return {
      value: this.reader.consume(),
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
    let nextChar = this.reader.peek()
    for (let i = 0; i < word.length; i++) {
      if (nextChar !== word[i]) {
        return false
      }
      nextChar = this.reader.peek(i + 1)
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
      this.reader.consume()
    }
  }

  private consumeGroup(): LexerTokenValue {
    return {
      value: this.reader.consume(),
      token: LexerToken.group,
    }
  }

  private consumePhrase(): LexerTokenValue {
    let nextChar = this.reader.consume()
    let value = nextChar
    while ((nextChar = this.reader.peek()) && nextChar !== this.quoteTerminator) {
      value += this.reader.consume()
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
    // let nextChar = this.reader.peek()
    let value = ''
    while (this.isAlphanumeric(this.reader.peek())) {
      value += this.reader.consume()
    }
    return value
  }

  private isWhitespace(char: string) {
    return ' \t\n\r'.includes(char)
  }

  private isAlphanumeric(char: string): boolean {
    const charCode = char.charCodeAt(0)
    return (
      (charCode >= 48 && charCode <= 57) ||
      (charCode >= 65 && charCode <= 90) ||
      (charCode >= 97 && charCode <= 122)
    )
  }
}
