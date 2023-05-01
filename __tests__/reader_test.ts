import { Parser } from '../src/parser'
import { BufferReader } from '../src/reader'
import { Lexer } from '../src/lexer'

test('Buffer reader should work', () => {
  const reader = new BufferReader(Buffer.from('(apple OR orange) AND (drink OR juice)'))
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
