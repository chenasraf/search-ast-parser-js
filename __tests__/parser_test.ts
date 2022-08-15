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
  const wordToken = tokens[0] as Operator
  expect(wordToken.type).toBe('operator')
  expect(wordToken.left.value).toBe('word')
  expect(wordToken.right.value).toBe('phrase')
})
