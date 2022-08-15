import { Lexer } from './lexer'
import { Parser, ParserToken } from './parser'
import { StringReader } from './reader'

export function parse(search: string): ParserToken[] {
  const reader = new StringReader(search)
  const lexer = new Lexer(reader)
  const parser = new Parser(lexer)
  return parser.parse()
}
