import { StringReader } from '../src/reader'
import { Token, Tokenizer } from '../src/tokenizer'

describe('Tokenizer', () => {
  describe('Phrase', () => {
    test('Should tokenize single', () => {
      const reader = new StringReader('"phrase"')
      const tokenizer = new Tokenizer(reader)
      const tokens = tokenizer.read()

      expect(tokens[0].token).toBe(Token.quote)
      expect(tokens[0].value).toBe('"')

      expect(tokens[1].token).toBe(Token.word)
      expect(tokens[1].value).toBe('phrase')

      expect(tokens[2].token).toBe(Token.quote)
      expect(tokens[2].value).toBe('"')
    })

    test('Should tokenize multi', () => {
      const reader = new StringReader('"one two three 123 !@#"')
      const tokenizer = new Tokenizer(reader)
      const tokens = tokenizer.read()

      expect(tokens[0].token).toBe(Token.quote)
      expect(tokens[0].value).toBe('"')

      expect(tokens[1].token).toBe(Token.word)
      expect(tokens[1].value).toBe('one two three 123 !@#')

      expect(tokens[2].token).toBe(Token.quote)
      expect(tokens[2].value).toBe('"')
    })
  })

  describe('Word', () => {
    test('Should tokenize single', () => {
      const reader = new StringReader('word')
      const tokenizer = new Tokenizer(reader)
      const tokens = tokenizer.read()

      expect(tokens[0].token).toBe(Token.word)
      expect(tokens[0].value).toBe('word')
    })

    test('Should tokenize multi', () => {
      const reader = new StringReader('one two three 123')
      const tokenizer = new Tokenizer(reader)
      const tokens = tokenizer.read()

      expect(tokens[0].token).toBe(Token.word)
      expect(tokens[0].value).toBe('one')

      expect(tokens[1].token).toBe(Token.whitespace)
      expect(tokens[1].value).toBe(' ')

      expect(tokens[2].token).toBe(Token.word)
      expect(tokens[2].value).toBe('two')

      expect(tokens[3].token).toBe(Token.whitespace)
      expect(tokens[3].value).toBe(' ')

      expect(tokens[4].token).toBe(Token.word)
      expect(tokens[4].value).toBe('three')

      expect(tokens[5].token).toBe(Token.whitespace)
      expect(tokens[5].value).toBe(' ')

      expect(tokens[6].token).toBe(Token.word)
      expect(tokens[6].value).toBe('123')
    })
  })

  describe('Groups', () => {
    test('Should tokenize single-word group', () => {
      const reader = new StringReader('(word)')
      const tokenizer = new Tokenizer(reader)
      const tokens = tokenizer.read()

      expect(tokens[0].token).toBe(Token.group)
      expect(tokens[0].value).toBe('(')

      expect(tokens[1].token).toBe(Token.word)
      expect(tokens[1].value).toBe('word')

      expect(tokens[2].token).toBe(Token.group)
      expect(tokens[2].value).toBe(')')
    })

    describe('logical operator OR group', () => {
      test('should parse OR separator', () => {
        const reader = new StringReader('(word OR word)')
        const tokenizer = new Tokenizer(reader)
        const tokens = tokenizer.read()

        expect(tokens[0].token).toBe(Token.group)
        expect(tokens[0].value).toBe('(')

        expect(tokens[1].token).toBe(Token.word)
        expect(tokens[1].value).toBe('word')

        expect(tokens[2].token).toBe(Token.whitespace)
        expect(tokens[2].value).toBe(' ')

        expect(tokens[3].token).toBe(Token.operator)
        expect(tokens[3].value).toBe('or')

        expect(tokens[4].token).toBe(Token.whitespace)
        expect(tokens[4].value).toBe(' ')

        expect(tokens[5].token).toBe(Token.word)
        expect(tokens[5].value).toBe('word')

        expect(tokens[6].token).toBe(Token.group)
        expect(tokens[6].value).toBe(')')
      })

      test('should parse | separator', () => {
        const reader = new StringReader('(word | word)')
        const tokenizer = new Tokenizer(reader)
        const tokens = tokenizer.read()

        expect(tokens[0].token).toBe(Token.group)
        expect(tokens[0].value).toBe('(')

        expect(tokens[1].token).toBe(Token.word)
        expect(tokens[1].value).toBe('word')

        expect(tokens[2].token).toBe(Token.whitespace)
        expect(tokens[2].value).toBe(' ')

        expect(tokens[3].token).toBe(Token.operator)
        expect(tokens[3].value).toBe('|')

        expect(tokens[4].token).toBe(Token.whitespace)
        expect(tokens[4].value).toBe(' ')

        expect(tokens[5].token).toBe(Token.word)
        expect(tokens[5].value).toBe('word')

        expect(tokens[6].token).toBe(Token.group)
        expect(tokens[6].value).toBe(')')
      })
    })

    describe('logical operator AND group', () => {
      test('should parse AND separator', () => {
        const reader = new StringReader('(word AND word)')
        const tokenizer = new Tokenizer(reader)
        const tokens = tokenizer.read()

        expect(tokens[0].token).toBe(Token.group)
        expect(tokens[0].value).toBe('(')

        expect(tokens[1].token).toBe(Token.word)
        expect(tokens[1].value).toBe('word')

        expect(tokens[2].token).toBe(Token.whitespace)
        expect(tokens[2].value).toBe(' ')

        expect(tokens[3].token).toBe(Token.operator)
        expect(tokens[3].value).toBe('and')

        expect(tokens[4].token).toBe(Token.whitespace)
        expect(tokens[4].value).toBe(' ')

        expect(tokens[5].token).toBe(Token.word)
        expect(tokens[5].value).toBe('word')

        expect(tokens[6].token).toBe(Token.group)
        expect(tokens[6].value).toBe(')')
      })
      test('should parse & separator', () => {
        const reader = new StringReader('(word & word)')
        const tokenizer = new Tokenizer(reader)
        const tokens = tokenizer.read()

        expect(tokens[0].token).toBe(Token.group)
        expect(tokens[0].value).toBe('(')

        expect(tokens[1].token).toBe(Token.word)
        expect(tokens[1].value).toBe('word')

        expect(tokens[2].token).toBe(Token.whitespace)
        expect(tokens[2].value).toBe(' ')

        expect(tokens[3].token).toBe(Token.operator)
        expect(tokens[3].value).toBe('&')

        expect(tokens[4].token).toBe(Token.whitespace)
        expect(tokens[4].value).toBe(' ')

        expect(tokens[5].token).toBe(Token.word)
        expect(tokens[5].value).toBe('word')

        expect(tokens[6].token).toBe(Token.group)
        expect(tokens[6].value).toBe(')')
      })
    })
  })
})
