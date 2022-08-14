import { InputReader } from './reader'

export enum TokenizerState {
  default,
  inPhrase,
  inGroup,
}

export enum Token {
  phrase = 'phrase',
  group = 'group',
  operator = 'operator',
  word = 'word',
  whitespace = 'whitespace',
  eof = 'eof',
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
          return this.consumePhrase()
        }

        if (this.isAlphanumeric(nextChar.charCodeAt(0))) {
          if (nextChar.toUpperCase() === 'O' && this.reader.peek(1) === 'R') {
            return this.consumeOr()
          }
          if (
            nextChar.toUpperCase() === 'A' &&
            this.reader.peek(1) === 'N' &&
            this.reader.peek(2) === 'D'
          ) {
            return this.consumeAnd()
          }
          return this.consumeWord()
        }

        if (nextChar === '(') {
          this.state = TokenizerState.inGroup
          return this.consumeGroup()
        }
        return this.consumeWord()
      case TokenizerState.inPhrase:
        if (nextChar === this.quoteTerminator) {
          this.state = TokenizerState.default
          return this.consumePhrase()
        }
        return this.consumeWord()
      case TokenizerState.inGroup:
        if (nextChar === ')') {
          this.state = TokenizerState.default
          return this.consumeGroup()
        }
        return this.consumeWord()
      default:
        throw new Error('bad state')
    }
  }
  consumeAnd(): TokenValue {
    return {
      value: 'and',
      token: Token.operator,
    }
  }
  consumeOr(): TokenValue {
    return {
      value: 'or',
      token: Token.operator,
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
    value += nextChar
    this.reader.consume()
    return {
      value,
      token: Token.phrase,
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

  // public read() {
  //   throw new Error('Method not implemented.')
  // }

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
