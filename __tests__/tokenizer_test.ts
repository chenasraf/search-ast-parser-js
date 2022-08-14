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

  describe('Groups', () => {
    it('Should tokenize single-word group', () => {
      const reader = new StringReader('(word)')
      const tokenizer = new Tokenizer(reader)

      let token = tokenizer.consume()
      expect(token.token).toBe(Token.group)
      expect(token.value).toBe('(')

      token = tokenizer.consume()
      expect(token.token).toBe(Token.word)
      expect(token.value).toBe('word')

      token = tokenizer.consume()
      expect(token.token).toBe(Token.group)
      expect(token.value).toBe(')')
    })

    it('Should tokenize logical operator OR group', () => {
      const reader = new StringReader('(word OR word)')
      const tokenizer = new Tokenizer(reader)

      let token = tokenizer.consume()
      expect(token.token).toBe(Token.group)
      expect(token.value).toBe('(')

      token = tokenizer.consume()
      expect(token.token).toBe(Token.word)
      expect(token.value).toBe('word')

      token = tokenizer.consume()
      expect(token.token).toBe(Token.whitespace)
      expect(token.value).toBe(' ')

      token = tokenizer.consume()
      expect(token.token).toBe(Token.operator)
      expect(token.value).toBe('or')

      token = tokenizer.consume()
      expect(token.token).toBe(Token.whitespace)
      expect(token.value).toBe(' ')

      token = tokenizer.consume()
      expect(token.token).toBe(Token.word)
      expect(token.value).toBe('word')

      token = tokenizer.consume()
      expect(token.token).toBe(Token.group)
      expect(token.value).toBe(')')
    })

    it('Should tokenize logical operator AND group', () => {
      const reader = new StringReader('(word AND word)')
      const tokenizer = new Tokenizer(reader)

      let token = tokenizer.consume()
      expect(token.token).toBe(Token.group)
      expect(token.value).toBe('(')

      token = tokenizer.consume()
      expect(token.token).toBe(Token.word)
      expect(token.value).toBe('word')

      token = tokenizer.consume()
      expect(token.token).toBe(Token.whitespace)
      expect(token.value).toBe(' ')

      token = tokenizer.consume()
      expect(token.token).toBe(Token.operator)
      expect(token.value).toBe('and')

      token = tokenizer.consume()
      expect(token.token).toBe(Token.whitespace)
      expect(token.value).toBe(' ')

      token = tokenizer.consume()
      expect(token.token).toBe(Token.word)
      expect(token.value).toBe('word')

      token = tokenizer.consume()
      expect(token.token).toBe(Token.group)
      expect(token.value).toBe(')')
    })
  })
})
