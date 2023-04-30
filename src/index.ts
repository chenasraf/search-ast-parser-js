import { Lexer } from './lexer'
import { Parser, ParserToken } from './parser'
import { StringReader } from './reader'

export * from './utils'
export * from './parser'
export * from './lexer'
export * from './reader'
// export * from './error_handler'

/**
 * Parse a search string into a list of tokens.
 * @param search The search string to parse.
 * @returns A list of tokens.
 *
 * @example
 * ```ts
 * import { parse } from 'search-lexer'
 * const tokens = parse('foo OR bar')
 * console.log(tokens)
 * ```
 */
export function parse(search: string): ParserToken[] {
  const reader = new StringReader(search)
  const lexer = new Lexer(reader)
  const parser = new Parser(lexer)
  return parser.parse()
}
