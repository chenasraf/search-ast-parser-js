import { InputReader } from './reader'

export enum TokenizerState {
  default,
  inPhrase,
}

export enum Token {
  // phrase = 'phrase',
  group = 'group',
  operator = 'operator',
  word = 'word',
  quote = 'quote',
  whitespace = 'whitespace',
  // eof = 'eof',
}

export interface TokenValue {
  value: string
  token: Token
}

export class Tokenizer implements InputReader<TokenValue> {
  reader: InputReader<string>
  state: TokenizerState = TokenizerState.default
  quoteTerminator: string | null = null
  index: number = 0
  peekIndex: number = 0

  constructor(reader: InputReader<string>) {
    this.reader = reader
  }

  public isEOF(): boolean {
    return this.reader.isEOF()
  }

  public setIndex(n: number): void {
    this.index = n
  }

  private readNextToken(): TokenValue {
    const nextChar = this.reader.peek()
    switch (this.state) {
      case TokenizerState.default:
        if (this.isWhitespace(nextChar)) {
          return {
            value: this.reader.consume(),
            token: Token.whitespace,
          }
        }
        if (`"'`.includes(nextChar)) {
          this.state = TokenizerState.inPhrase
          this.quoteTerminator = nextChar
          return this.consumeQuote()
        }

        if (this.isAlphanumeric(nextChar.charCodeAt(0))) {
          if (this.confirmExactWord('OR')) {
            return this.consumeOr()
          }
          if (this.confirmExactWord('AND')) {
            return this.consumeAnd()
          }
          return this.consumeWord()
        }

        if (nextChar === '|') {
          return this.consumeOr()
        }

        if (nextChar === '&') {
          return this.consumeAnd()
        }

        if (nextChar === '(' || nextChar === ')') {
          return this.consumeGroup()
        }
        return this.consumeWord()
      case TokenizerState.inPhrase:
        if (nextChar === this.quoteTerminator) {
          this.state = TokenizerState.default
          return this.consumeQuote()
        }
        return this.consumePhrase()
      default:
        throw new Error('bad state')
    }
  }

  consumeQuote(): TokenValue {
    return {
      value: this.reader.consume(),
      token: Token.quote,
    }
  }

  consumeAnd(): TokenValue {
    let value = ''
    if (this.confirmExactWord('AND')) {
      this.consumeExactWord('AND')
      value = 'and'
    } else if (this.confirmExactWord('&')) {
      this.consumeExactWord('&')
      value = '&'
    }
    return {
      value,
      token: Token.operator,
    }
  }

  consumeOr(): TokenValue {
    let value = ''
    if (this.confirmExactWord('OR')) {
      this.consumeExactWord('OR')
      value = 'or'
    } else if (this.confirmExactWord('|')) {
      this.consumeExactWord('|')
      value = '|'
    }
    return {
      value,
      token: Token.operator,
    }
  }

  confirmExactWord(word: string) {
    let nextChar = this.reader.peek()
    for (let i = 0; i < word.length; i++) {
      if (nextChar !== word[i]) {
        return false
      }
      nextChar = this.reader.peek(i + 1)
    }
    return true
  }

  consumeExactWord(word: string) {
    if (this.confirmExactWord(word)) {
      this.consumeReader(word.length)
    } else {
      throw new Error("Can't find exact word: " + word)
    }
  }

  consumeReader(times = 1) {
    for (let i = 0; i < times; i++) {
      this.reader.consume()
    }
  }

  private consumeGroup(): TokenValue {
    return {
      value: this.reader.consume(),
      token: Token.group,
    }
  }

  private consumePhrase(): TokenValue {
    let nextChar = this.reader.consume()
    let value = nextChar
    while ((nextChar = this.reader.peek()) && nextChar !== this.quoteTerminator) {
      value += this.reader.consume()
    }
    return {
      value,
      token: Token.word,
    }
  }

  private consumeWord(): TokenValue {
    let value = this.consumeWholeWord()
    return {
      value,
      token: Token.word,
    }
  }

  private consumeWholeWord() {
    // let nextChar = this.reader.peek()
    let value = ''
    while (this.isAlphanumeric(this.reader.peek().charCodeAt(0))) {
      value += this.reader.consume()
    }
    return value
  }

  public peek(): TokenValue {
    const beforePeekState = this.state
    const beforePeekIndex = this.reader.index
    // this.peekIndex = this.currentIndex + n
    const value = this.readNextToken()
    this.state = beforePeekState
    this.reader.setIndex(beforePeekIndex)
    return value
    // return this.readNextToken()
  }

  public consume(): TokenValue {
    const token = this.readNextToken()
    // this.reader.consume()
    this.index++
    return token
  }

  public read(): TokenValue[] {
    const tokens: TokenValue[] = []
    while (!this.isEOF()) {
      tokens.push(this.consume())
    }
    return tokens
  }

  private isWhitespace(nextChar: string) {
    return ' \t\n\r'.includes(nextChar)
  }

  private isAlphanumeric(charCode: number): boolean {
    return (
      (charCode >= 48 && charCode <= 57) ||
      (charCode >= 65 && charCode <= 90) ||
      (charCode >= 97 && charCode <= 122)
    )
  }
}
