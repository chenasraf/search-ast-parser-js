import { InputReader } from './reader'
import { ILexer, LexerToken, LexerTokenValue } from './lexer'

export interface ParserTokenValue {
  type: 'word' | 'operator' | 'phrase' | 'group'
}

export interface Phrase extends ParserTokenValue {
  type: 'phrase'
  value: string
  quote: "'" | '"'
}

export interface Word extends ParserTokenValue {
  type: 'word'
  value: string
}

export interface Operator extends ParserTokenValue {
  type: 'operator'
  value: string
  left: any
  right: any
}

export interface Group extends ParserTokenValue {
  type: 'group'
  children: any[]
}

export type ParserToken = Phrase | Word | Operator | Group

export abstract class IParser {
  public lexer: ILexer
  public abstract index: number

  constructor(lexer: ILexer) {
    this.lexer = lexer
  }

  public abstract peek(amount?: number): ParserToken | null
  public abstract consume(amount?: number): ParserToken | null
  public abstract parse(): ParserToken[]
  public abstract isEOF(): boolean
}

export enum ParserState {
  default,
}

export class Parser extends IParser {
  index = 0
  state = ParserState.default
  cache: ParserToken[] = []

  constructor(lexer: ILexer) {
    super(lexer)
    this.state = ParserState.default
  }

  public peek(amount = 0): ParserToken | null {
    const cacheIndex = this.index + amount
    if (this.isEOF()) {
      return null
    }
    if (cacheIndex < this.cache.length) {
      return this.cache[cacheIndex]
    }
    // const beforePeekIndex = this.lexer.index
    this.fillCache(cacheIndex)
    const token = this.cache[cacheIndex]
    // this.lexer.setIndex(beforePeekIndex)
    return token
  }

  public consume(amount = 0): ParserToken | null {
    const cacheIndex = this.index + amount
    this.index = cacheIndex + 1

    if (this.cache[cacheIndex]) {
      return this.cache[cacheIndex]
    }
    if (this.isEOF()) {
      return null
    }

    this.fillCache(cacheIndex)
    const token = this.cache[cacheIndex]
    return token
  }

  private fillCache(n: number) {
    const { index } = this
    for (let i = 0; i <= n; i++) {
      this.index = i
      if (this.isEOF()) {
        return
      }
      if (this.cache[i]) {
        continue
      }
      const value = this.readNextToken()
      this.cache[i] = value!
    }
    this.index = index
  }

  public parse(): ParserToken[] {
    const tokens: ParserToken[] = []
    while (!this.isEOF()) {
      const token = this.consume()
      if (!token) {
        return tokens
      }
      tokens.push(token)
    }
    return tokens
  }

  public isEOF(): boolean {
    return this.lexer.isEOF()
  }

  private readNextToken(): ParserToken | null {
    let token = this.lexer.peek()
    let nextToken = this.lexer.peek(1)

    switch (this.state) {
      case ParserState.default:
        if (token?.token === 'whitespace') {
          this.index++
          this.lexer.consume()
          return this.readNextToken()
        }
        while (nextToken && nextToken.token === 'whitespace') {
          nextToken = this.lexer.peek(1)
          this.lexer.consume()
        }
        if (nextToken?.token === 'group' || nextToken?.token === 'operator') {
          this.index++
          return this.consumeOperator(token!, nextToken)
        }
        switch (token?.token) {
          case LexerToken.word:
            return { type: 'word', value: this.lexer.consume()!.value }
          case LexerToken.quote:
            return this.consumePhrase(token)
          case LexerToken.operator:
            return this.consumeOperator(token, nextToken!)
          default:
            return null
        }
      default:
        throw new Error('Bad state')
    }
  }

  private consumePhrase(token: LexerTokenValue): ParserToken | null {
    this.lexer.consume()
    const quoteContent = this.lexer.consume()!
    this.lexer.consume()
    return { type: 'phrase', value: quoteContent.value, quote: token.value as '"' }
  }

  private consumeOperator(left: LexerTokenValue, opToken: LexerTokenValue): ParserToken | null {
    // const left = this.cache[this.cache.length - 1]
    this.index++
    this.lexer.consume()
    const right = this.readNextToken()
    this.lexer.consume()
    // const right = this.readNextToken()
    return { type: 'operator', value: opToken.value, left, right }
  }
}
