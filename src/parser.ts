import { InputReader } from './reader'
import { ILexer, LexerToken, LexerTokenValue } from './tokenizer'

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

  public abstract peek(): ParserToken | null
  public abstract consume(): ParserToken | null
  public abstract parse(): ParserToken[]
  public abstract isEOF(): boolean
}

export enum ParserState {
  default,
}

export class Parser extends IParser {
  index = 0
  state = ParserState.default
  stack: ParserToken[] = []

  constructor(lexer: ILexer) {
    super(lexer)
    this.state = ParserState.default
  }

  public peek(): ParserToken | null {
    if (this.isEOF()) {
      return null
    }
    if (this.index < this.stack.length) {
      return this.stack[this.index]
    }

    const beforePeekIndex = this.lexer.index
    const value = this.readNextToken()
    if (value) {
      this.stack.push(value)
    }
    this.lexer.setIndex(beforePeekIndex)
    return value
  }

  public consume(): ParserToken | null {
    if (this.isEOF()) {
      return null
    }
    if (this.index < this.stack.length) {
      this.index++
      return this.stack[this.index]
    }

    const token = this.readNextToken()
    this.index++
    if (token) {
      this.stack.push(token)
    }
    return token
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
    const token = this.lexer.consume()
    let nextToken = this.lexer.peek()
    // TODO reset lexer index?
    while (nextToken?.token === 'whitespace') {
      this.lexer.consume()
      nextToken = this.lexer.peek()
    }
    switch (this.state) {
      case ParserState.default:
        if (nextToken.token === 'group') {
          this.index++
          return this.readNextToken()
        }
        switch (token.token) {
          case LexerToken.word:
            return { type: 'word', value: token.value }
          case LexerToken.quote:
            return { type: 'phrase', value: token.value, quote: token.value as '"' }
          case LexerToken.operator:
            return this.consumeOperator(token)
          default:
            return null
        }
      default:
        throw new Error('Bad state')
    }
  }

  private consumeOperator(token: LexerTokenValue): ParserToken | null {
    const left = this.stack[this.stack.length - 1]
    const right = this.readNextToken()
    return { type: 'operator', value: token.value, left, right }
  }
}
