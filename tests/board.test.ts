import assert from 'node:assert/strict'
import { test } from 'node:test'
import { placeCard } from '../src/lib/sort'

test('places a card between two neighbours', () => {
  assert.deepEqual(placeCard(['a', 'b', 'c'], 'x', 1), ['a', 'x', 'b', 'c'])
})

test('moves a card within the same list', () => {
  assert.deepEqual(placeCard(['a', 'b', 'c'], 'a', 2), ['b', 'c', 'a'])
})
