import { describe, expect, test } from '@rstest/core'

import { getASTNodeImport } from '#plugins/shared.ts'

describe('getASTNodeImport', () => {
  describe('with string name (default import)', () => {
    test('creates mdxjsEsm node with correct type', () => {
      const result = getASTNodeImport('MyComponent', './component.tsx')

      expect(result.type).toBe('mdxjsEsm')
    })

    test('generates correct import statement value', () => {
      const result = getASTNodeImport('MyComponent', './component.tsx')

      expect(result.value).toBe('import MyComponent from "./component.tsx"')
    })

    test('creates ImportDefaultSpecifier in estree', () => {
      const result = getASTNodeImport('MyComponent', './component.tsx')
      const importDecl = result.data!.estree!.body[0] as {
        specifiers: Array<{ type: string; local: { name: string } }>
      }

      expect(importDecl.specifiers).toHaveLength(1)
      expect(importDecl.specifiers[0].type).toBe('ImportDefaultSpecifier')
      expect(importDecl.specifiers[0].local.name).toBe('MyComponent')
    })

    test('sets source correctly', () => {
      const result = getASTNodeImport('image', './test.png')
      const importDecl = result.data!.estree!.body[0] as {
        source: { value: string; raw: string }
      }

      expect(importDecl.source.value).toBe('./test.png')
      expect(importDecl.source.raw).toBe('"./test.png"')
    })

    test('handles paths with special characters', () => {
      const result = getASTNodeImport('data', './path/to/file with spaces.json')

      expect(result.value).toBe(
        'import data from "./path/to/file with spaces.json"',
      )
    })
  })

  describe('with object name (named imports)', () => {
    test('generates named import with same local name', () => {
      const result = getASTNodeImport({ Button: 'Button' }, './components')

      expect(result.value).toBe('import {Button} from "./components"')
    })

    test('generates named import with alias', () => {
      const result = getASTNodeImport({ default: 'MyDefault' }, './module')

      expect(result.value).toBe('import {default as MyDefault} from "./module"')
    })

    test('generates named import with null local (uses imported name)', () => {
      const result = getASTNodeImport({ Button: null }, './components')

      expect(result.value).toBe('import {Button} from "./components"')
    })

    test('generates multiple named imports', () => {
      const result = getASTNodeImport(
        { Button: 'Button', Input: 'TextInput' },
        './components',
      )

      expect(result.value).toBe(
        'import {Button,Input as TextInput} from "./components"',
      )
    })

    test('creates ImportSpecifiers in estree for named imports', () => {
      const result = getASTNodeImport(
        { Button: 'MyButton', Icon: null },
        './components',
      )
      const importDecl = result.data!.estree!.body[0] as {
        specifiers: Array<{
          type: string
          imported: { name: string }
          local: { name: string }
        }>
      }

      expect(importDecl.specifiers).toHaveLength(2)
      expect(importDecl.specifiers[0].type).toBe('ImportSpecifier')
      expect(importDecl.specifiers[0].imported.name).toBe('Button')
      expect(importDecl.specifiers[0].local.name).toBe('MyButton')
      expect(importDecl.specifiers[1].imported.name).toBe('Icon')
      expect(importDecl.specifiers[1].local.name).toBe('Icon')
    })

    test('handles empty object', () => {
      const result = getASTNodeImport({}, './module')

      expect(result.value).toBe('import {} from "./module"')
    })
  })

  describe('estree structure', () => {
    test('has Program type', () => {
      const result = getASTNodeImport('test', './test')

      expect(result.data!.estree!.type).toBe('Program')
    })

    test('has module sourceType', () => {
      const result = getASTNodeImport('test', './test')

      expect(result.data!.estree!.sourceType).toBe('module')
    })

    test('has ImportDeclaration in body', () => {
      const result = getASTNodeImport('test', './test')
      const body = result.data!.estree!.body[0] as { type: string }

      expect(body.type).toBe('ImportDeclaration')
    })

    test('has empty attributes array', () => {
      const result = getASTNodeImport('test', './test')
      const importDecl = result.data!.estree!.body[0] as {
        attributes: unknown[]
      }

      expect(importDecl.attributes).toEqual([])
    })
  })
})
