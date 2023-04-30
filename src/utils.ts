import { ParserToken } from './parser'

/**
 * Filter data based on parsed query
 *
 * @param parsed - parsed query
 * @param data - data to filter
 * @param map - map function to apply to data before filtering
 * @returns filtered data
 *
 * @example
 * ```ts
 * const data = ['Hello', 'World', 'Foo', 'Bar']
 * const parsed = parse('Hello OR (World AND Bar)')
 * const filtered = filter(parsed, data)
 * console.log(filtered) // ['Hello', 'World', 'Bar']
 * ```
 */
export function filter(
  parsed: ParserToken[],
  data: string[],
  map?: (item: string) => string,
): string[]
export function filter<T>(parsed: ParserToken[], data: T[], map: (item: T) => string): string[]
export function filter<T = string>(
  parsed: ParserToken[],
  data: T[],
  map?: (item: T) => string,
): T[] {
  return data.filter((_item) => {
    let item: string
    item = map?.(_item) ?? String(_item)
    for (const check of parsed) {
      if (checkItem(check, item)) {
        return true
      }
    }
    return false
  })
}

/**
 * Check if item matches a single token
 * @param check - token to check
 * @param item - item to check
 * @returns true if item matches token
 *
 * @example
 * ```ts
 * const check = parse('Hello OR (World AND Bar)')
 * const item = 'Hello'
 * const matches = checkItem(check, item)
 * console.log(matches) // true
 * ```
 */
export function checkItem(check: ParserToken, item: string): boolean {
  item = String(item).toLowerCase()
  switch (check.type) {
    case 'word':
      return item.includes(check.value.toLowerCase())
    case 'operator':
      if (check.value.toUpperCase() === 'OR') {
        return checkItem(check.left, item) || checkItem(check.right, item)
      }
      if (check.value.toUpperCase() === 'AND') {
        return checkItem(check.left, item) && checkItem(check.right, item)
      }
      throw new Error(`Unknown operator: ${check.value}`)
    case 'group':
      return filter(check.children, [item]).length > 0
    case 'phrase':
      return item.includes(check.value.toLowerCase())
  }
}
