<h1>Search Query AST Parser for JS</h1>

[NPM](https://www.npmjs.com/package/search-parse) |
[Documentation](https://chenasraf.github.io/search-ast-parser-js)

This is a package for JS applications that parses search queries with the common search operator
features such as logical or/and, grouping, phrases (in quotes), etc.

This package only implements a very simple `filter` utility function that takes a list of items or
objects with a map to string function, and returns elements matching the query.

For more advanced use-cases, you can easily implement your own filter function.  
See [utils.ts#filter](/src/utils.ts#L10) for an example.

---

<!-- toc -->
<details>
<summary>Table of contents</summary>

- [Example results](#example-results)
- [How to use](#how-to-use)
- [Supported operators](#supported-operators)
  - [Implemented](#implemented)
  - [To Do](#to-do)

</details>
<!-- tocstop -->

---

## Example results

**Input:** `orange OR "golden apple"`

**Explanation:** the word "orange" or the exact phrase "golden apple"

**Output**:

```js
const result = [
  {
    type: 'operator',
    value: 'or',
    left: {
      type: 'word',
      value: 'orange',
    },
    right: {
      type: 'phrase',
      value: 'golden apple',
      quote: '"',
    },
  },
]
```

**Input:** `(mango banana lemon) OR apple -pineapple`

**Explanation:** Either one of the words: "mango", "banana", or "lemon"; OR the word "apple";
exclude all results containing "pineapple"

**Output**:

```js
const result = [
  {
    type: 'operator',
    value: 'or',
    left: {
      type: 'group',
      children: [
        {
          type: 'word',
          value: 'mango',
        },
        {
          type: 'word',
          value: 'banana',
        },
        {
          type: 'word',
          value: 'lemon',
        },
      ],
    },
    right: {
      type: 'word',
      value: 'apple',
    },
  },
  {
    type: 'exclude',
    value: 'pineapple',
  },
]
```

## How to use

Install the package using `pnpm`, `npm` or `yarn`:

```shell
pnpm add search-parse
npm install search-parse
yarn add search-parse
```

Simply pass a string to the parse function to get the results.

```js
import { parse } from 'search-parse'
const results = parse('(mango banana lemon) OR apple -pineapple')
```

## Supported operators

This is the comprehensive list of operators and their object results:

### Implemented

- **Word:** `example`

  Any single word. Only alpha-numeric characters, dashes and underscores are considered a word. The
  rest is considered whitespace, which is ignored by the parser, but will cause the surrounding
  tokens to be broken apart.

  **Object:**

  ```js
  {
    type: 'word', // constant
    value: 'example' // this is the actual word in the string
  }
  ```

- **Phrase:** `"an example"` or `'an example'`

  A phrase can contain one or more characters. These characters are used as is and not validated as
  words, so they can include all sorts of special characters.

  A phrase can start with either a single or double quote, and must terminate using the same quote.
  The other type of quote than the one starting this sequence is ignored and considered part of the
  phrase itself when it inside it.

  **Object:**

  ```js
  {
    type: 'phrase', // constant
    value: 'an example', // the phrase contained in the quote
    quote: '"' // the quote used to start and end this sequence
  }
  ```

- **Group:** `(one two three)`

  A group can consist of one or more words or other types of values such as phrases or exclusions. A
  group logically puts its contents together, usually this is meant as an implicit OR operation but
  you can implement it as you require.

  **Object:**

  ```js
  {
    type: 'group', // constant
    children: [
      // all types of children nodes such as word, phrase, etc
      {
        type: 'word',
        value: 'one'
      },
      {
        type: 'word',
        value: 'two'
      },
      {
        type: 'word',
        value: 'three'
      }
    ]
  }
  ```

- **Logical operators _OR_ and _AND_:** `a OR b` or `a | b`, and `a AND b` or `a & b`

  Logical operators group their immediate left and immediate right in a logical operation.

  **Object:**

  ```js
  {
    type: 'operator',
    value: 'or', // or: 'and'
    left: { // whatever is on the left of the operator - word, phrase, etc
      type: 'word',
      value: 'a'
    },
    right: { // whatever is on the right of the operator - word, phrase, etc
      type: 'word',
      value: 'b'
    }
  }
  ```

### To Do

- **Exclusion:** `-example`

  An exclusion is an indication to not include results using the given word, phrase or group.

  **Object:**

  ```js
  {
    type: 'exclusion',
    value: { // all types of children nodes such as word, phrase, etc
      type: 'word',
      value: 'example'
    }
  }
  ```

- **Domain:** `example-domain:example-token`

  A domain prefix signals the following token to only refer to the prefixing domain. For example, a
  user could search `name:apple` to only search the word `apple` within the `name` property of the
  object being searched on.

  **Object:**

  ```js
  {
    type: 'domain',
    domain: 'example-domain',
    value: { // all types of children nodes such as word, phrase, etc
      type: 'word',
      value: 'example-token',
    }
  }
  ```

- **User:** `@example-user`

  A user query can signal only searching content from a specific user.

  **Object:**

  ```js
  {
    type: 'user',
    value: 'example-user',
  }
  ```
