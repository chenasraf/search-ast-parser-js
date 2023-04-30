import { parse } from './index'
import { ParserToken } from './parser'

const item = [
  'apple banana orange lemon',
  'apple banana orange',
  'apple banana',
  'apple',
  'banana orange lemon',
  'banana orange',
  'banana',
  'orange lemon',
  'orange',
]

function filter(parsed: ParserToken[], data: string[]): string[] {
  return data.filter((item) => {
    for (const check of parsed) {
      if (checkItem(check, item)) {
        return true
      }
    }
    return false
  })
}

function checkItem(check: ParserToken, item: string): boolean {
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

function main() {
  const query = '(apple OR banana) AND (orange OR lemon)'
  const result = parse(query)
  console.log('query:', query)
  console.log('parser result:', JSON.stringify(result, undefined, 2))
  console.log('search result:', filter(result, item))

  const query2 = '(apple OR banana AND (orange OR lemon'
  const result2 = parse(query2)
  console.log('query:', query2)
  console.log('parser result:', JSON.stringify(result2, undefined, 2))
  console.log('search result:', filter(result2, item))
}

main()
