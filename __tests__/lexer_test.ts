import { StringReader } from '../src/reader'
import { LexerToken, Lexer } from '../src/lexer'

describe('Phrase', () => {
  test('Should tokenize single', () => {
    const reader = new StringReader('"phrase"')
    const lexer = new Lexer(reader)
    const tokens = lexer.parse()

    expect(tokens[0].token).toBe(LexerToken.quote)
    expect(tokens[0].value).toBe('"')

    expect(tokens[1].token).toBe(LexerToken.word)
    expect(tokens[1].value).toBe('phrase')

    expect(tokens[2].token).toBe(LexerToken.quote)
    expect(tokens[2].value).toBe('"')
  })

  test('Should tokenize multi', () => {
    const reader = new StringReader('"one two three 123 !@#"')
    const lexer = new Lexer(reader)
    const tokens = lexer.parse()

    expect(tokens[0].token).toBe(LexerToken.quote)
    expect(tokens[0].value).toBe('"')

    expect(tokens[1].token).toBe(LexerToken.word)
    expect(tokens[1].value).toBe('one two three 123 !@#')

    expect(tokens[2].token).toBe(LexerToken.quote)
    expect(tokens[2].value).toBe('"')
  })
})

describe('Word', () => {
  test('Should tokenize single', () => {
    const reader = new StringReader('word')
    const lexer = new Lexer(reader)
    const tokens = lexer.parse()

    expect(tokens[0].token).toBe(LexerToken.word)
    expect(tokens[0].value).toBe('word')
  })

  test('Should tokenize multi', () => {
    const reader = new StringReader('one two three 123')
    const lexer = new Lexer(reader)
    const tokens = lexer.parse()

    expect(tokens[0].token).toBe(LexerToken.word)
    expect(tokens[0].value).toBe('one')

    expect(tokens[1].token).toBe(LexerToken.whitespace)
    expect(tokens[1].value).toBe(' ')

    expect(tokens[2].token).toBe(LexerToken.word)
    expect(tokens[2].value).toBe('two')

    expect(tokens[3].token).toBe(LexerToken.whitespace)
    expect(tokens[3].value).toBe(' ')

    expect(tokens[4].token).toBe(LexerToken.word)
    expect(tokens[4].value).toBe('three')

    expect(tokens[5].token).toBe(LexerToken.whitespace)
    expect(tokens[5].value).toBe(' ')

    expect(tokens[6].token).toBe(LexerToken.word)
    expect(tokens[6].value).toBe('123')
  })
})

describe('Groups', () => {
  test('Should tokenize single-word group', () => {
    const reader = new StringReader('(word)')
    const lexer = new Lexer(reader)
    const tokens = lexer.parse()

    expect(tokens[0].token).toBe(LexerToken.group)
    expect(tokens[0].value).toBe('(')

    expect(tokens[1].token).toBe(LexerToken.word)
    expect(tokens[1].value).toBe('word')

    expect(tokens[2].token).toBe(LexerToken.group)
    expect(tokens[2].value).toBe(')')
  })
})

describe('Logical operator OR', () => {
  test('Should parse OR separator', () => {
    const reader = new StringReader('word OR word')
    const lexer = new Lexer(reader)
    const tokens = lexer.parse()

    expect(tokens[0].token).toBe(LexerToken.word)
    expect(tokens[0].value).toBe('word')

    expect(tokens[1].token).toBe(LexerToken.whitespace)
    expect(tokens[1].value).toBe(' ')

    expect(tokens[2].token).toBe(LexerToken.operator)
    expect(tokens[2].value).toBe('or')

    expect(tokens[3].token).toBe(LexerToken.whitespace)
    expect(tokens[3].value).toBe(' ')

    expect(tokens[4].token).toBe(LexerToken.word)
    expect(tokens[4].value).toBe('word')
  })

  test('Should not parse OR separator mid-word', () => {
    const reader = new StringReader('wordORword')
    const lexer = new Lexer(reader)
    const tokens = lexer.parse()

    expect(tokens[0].token).toBe(LexerToken.word)
    expect(tokens[0].value).toBe('wordORword')
  })

  test('Should parse | separator', () => {
    const reader = new StringReader('word | word')
    const lexer = new Lexer(reader)
    const tokens = lexer.parse()

    expect(tokens[0].token).toBe(LexerToken.word)
    expect(tokens[0].value).toBe('word')

    expect(tokens[1].token).toBe(LexerToken.whitespace)
    expect(tokens[1].value).toBe(' ')

    expect(tokens[2].token).toBe(LexerToken.operator)
    expect(tokens[2].value).toBe('|')

    expect(tokens[3].token).toBe(LexerToken.whitespace)
    expect(tokens[3].value).toBe(' ')

    expect(tokens[4].token).toBe(LexerToken.word)
    expect(tokens[4].value).toBe('word')
  })
})

describe('Logical operator AND', () => {
  test('Should parse AND separator', () => {
    const reader = new StringReader('word AND word')
    const lexer = new Lexer(reader)
    const tokens = lexer.parse()

    expect(tokens[0].token).toBe(LexerToken.word)
    expect(tokens[0].value).toBe('word')

    expect(tokens[1].token).toBe(LexerToken.whitespace)
    expect(tokens[1].value).toBe(' ')

    expect(tokens[2].token).toBe(LexerToken.operator)
    expect(tokens[2].value).toBe('and')

    expect(tokens[3].token).toBe(LexerToken.whitespace)
    expect(tokens[3].value).toBe(' ')

    expect(tokens[4].token).toBe(LexerToken.word)
    expect(tokens[4].value).toBe('word')
  })

  test('Should not parse AND separator mid-word', () => {
    const reader = new StringReader('wordANDword')
    const lexer = new Lexer(reader)
    const tokens = lexer.parse()

    expect(tokens[0].token).toBe(LexerToken.word)
    expect(tokens[0].value).toBe('wordANDword')
  })

  test('Should parse & separator', () => {
    const reader = new StringReader('word & word')
    const lexer = new Lexer(reader)
    const tokens = lexer.parse()

    expect(tokens[0].token).toBe(LexerToken.word)
    expect(tokens[0].value).toBe('word')

    expect(tokens[1].token).toBe(LexerToken.whitespace)
    expect(tokens[1].value).toBe(' ')

    expect(tokens[2].token).toBe(LexerToken.operator)
    expect(tokens[2].value).toBe('&')

    expect(tokens[3].token).toBe(LexerToken.whitespace)
    expect(tokens[3].value).toBe(' ')

    expect(tokens[4].token).toBe(LexerToken.word)
    expect(tokens[4].value).toBe('word')
  })
})
