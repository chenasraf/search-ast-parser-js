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
    if (cacheIndex < this.cache.length) {
      return this.cache[cacheIndex]
    }
    if (this.isEOF()) {
      return null
    }
    this.fillCache(cacheIndex)
    const token = this.cache[cacheIndex]
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
      if (token.type === 'operator' && tokens.length && token.left === undefined) {
        token.left = tokens.pop()
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
        nextToken = this.peekSkipWhitespace(nextToken)
        // lookahead
        switch (nextToken?.token) {
          case LexerToken.operator:
            // this.index++
            this.lexer.consume()
            const parsed = this.parseNormalLexToken(token!)!
            const nextParsed = this.readNextToken()!
            this.index++
            this.lexer.consume()
            return this.consumeOperator(parsed, nextToken, nextParsed)
          case LexerToken.group:
            if (nextToken.value === ')') {
              return this.parseNormalLexToken(token)
            }
            if (token?.token == 'operator') {
              return this.consumeOperator(this.cache[this.index - 1], token, this.readNextToken()!)
            }
            this.index++
            this.lexer.consume()
            return this.consumeGroup(nextToken!)
        }

        // no special token coming up, proceed with this token
        this.lexer.consume()
        return this.parseNormalLexToken(token)
      default:
        throw new Error('Bad state')
    }
  }

  private peekSkipWhitespace(nextToken: LexerTokenValue | null) {
    while (nextToken && nextToken.token === 'whitespace') {
      this.lexer.consume()
      nextToken = this.lexer.peek()
    }
    return nextToken
  }

  private parseNormalLexToken(token: LexerTokenValue | null): ParserToken | null {
    switch (token?.token) {
      case LexerToken.word:
        return this.consumeWord(token)
      case LexerToken.quote:
        // TODO might need to reconsider consuming here.
        const quoteContent = this.lexer.consume()!
        this.lexer.consume()
        return this.consumePhrase(token, quoteContent)
      case LexerToken.group:
        // this.lexer.consume()
        return this.consumeGroup(token!)
      // case LexerToken.operator:
      //   return this.consumeOperator(this.cache[this.index - 1], token, this.readNextToken())
      default:
        return null
    }
  }

  private consumeWord(word: LexerTokenValue): ParserToken | null {
    // TODO might need to reconsider consuming here.
    return { type: 'word', value: word.value }
  }

  private consumePhrase(token: LexerTokenValue, quoteContent: LexerTokenValue): ParserToken | null {
    // TODO might need to reconsider consuming here.
    return { type: 'phrase', value: quoteContent.value, quote: token.value as '"' }
  }

  private consumeOperator(
    left: ParserToken,
    opToken: LexerTokenValue,
    right: ParserToken,
  ): ParserToken | null {
    // this.lexer.consume()
    return { type: 'operator', value: opToken.value, left, right }
  }

  private consumeGroup(token: LexerTokenValue): ParserToken | null {
    const children: ParserToken[] = []
    let nextToken = this.peekSkipWhitespace(this.lexer.peek())
    while (nextToken && nextToken?.value !== ')') {
      const child = this.readNextToken()
      if (child) {
        children.push(child)
      }
      nextToken = this.lexer.peek()
    }
    this.lexer.consume()
    return { type: 'group', children }
  }
}
