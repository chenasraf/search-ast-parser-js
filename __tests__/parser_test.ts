import { Operator, Parser, Word } from '../src/parser'
import { StringReader } from '../src/reader'
import { Lexer } from '../src/lexer'

test('should parse single word', () => {
  const reader = new StringReader('word')
  const lexer = new Lexer(reader)
  const parser = new Parser(lexer)
  const tokens = parser.parse()
  const wordToken = tokens[0] as Word
  expect(wordToken.type).toBe('word')
  expect(wordToken.value).toBe('word')
})

test('should parse OR operator', () => {
  const reader = new StringReader('word OR "phrase"')
  const lexer = new Lexer(reader)
  const parser = new Parser(lexer)
  const tokens = parser.parse()
  expect(tokens[0]).toEqual({
    type: 'operator',
    value: 'or',
    left: {
      type: 'word',
      value: 'word',
    },
    right: {
      type: 'phrase',
      value: 'phrase',
      quote: '"',
    },
  })
})

test('should parse AND operator', () => {
  const reader = new StringReader('word AND "phrase"')
  const lexer = new Lexer(reader)
  const parser = new Parser(lexer)
  const tokens = parser.parse()
  expect(tokens[0]).toEqual({
    type: 'operator',
    value: 'and',
    left: {
      type: 'word',
      value: 'word',
    },
    right: {
      type: 'phrase',
      value: 'phrase',
      quote: '"',
    },
  })
})

test('should parse multiple groups and logical operators', () => {
  const reader = new StringReader('(apple OR orange) AND (drink OR juice)')
  const lexer = new Lexer(reader)
  const parser = new Parser(lexer)
  const tokens = parser.parse()
  expect(tokens[0]).toEqual({
    type: 'operator',
    value: 'and',
    left: {
      type: 'group',
      children: [
        {
          type: 'operator',
          value: 'or',
          left: { type: 'word', value: 'apple' },
          right: { type: 'word', value: 'orange' },
        },
      ],
    },
    right: {
      type: 'group',
      children: [
        {
          type: 'operator',
          value: 'or',
          left: { type: 'word', value: 'drink' },
          right: { type: 'word', value: 'juice' },
        },
      ],
    },
  })
})
