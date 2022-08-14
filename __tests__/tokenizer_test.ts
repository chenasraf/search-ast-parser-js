import { StringReader } from '../src/reader'
import { Token, Tokenizer } from '../src/tokenizer'

describe('Tokenizer', () => {
  test('Should tokenize phrase', () => {
    const reader = new StringReader('"phrase"')
    const tokenizer = new Tokenizer(reader)
    const token = tokenizer.peek()
    expect(token.token).toBe(Token.phrase)
    expect(token.value).toBe('"phrase"')
  })

  test('Should tokenize word', () => {
    const reader = new StringReader('word')
    const tokenizer = new Tokenizer(reader)
    const token = tokenizer.peek()
    expect(token.token).toBe(Token.word)
    expect(token.value).toBe('word')
  })

  test('Should tokenize group', () => {
    const reader = new StringReader('(word)')
    const tokenizer = new Tokenizer(reader)
    let token = tokenizer.peek()
    tokenizer.consume()
    expect(token.token).toBe(Token.group)
    expect(token.value).toBe('(')
    token = tokenizer.peek()
    tokenizer.consume()
    expect(token.token).toBe(Token.word)
    expect(token.value).toBe('word')
    token = tokenizer.peek()
    expect(token.token).toBe(Token.group)
    expect(token.value).toBe(')')
  })
})
