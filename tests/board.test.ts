import assert from 'node:assert/strict'
import { test } from 'node:test'
import { placeCard } from '../src/lib/sort'

test('places a card between two neighbours', () => {
  assert.deepEqual(placeCard(['a', 'b', 'c'], 'x', 1), ['a', 'x', 'b', 'c'])
})

test('moves a card within the same list', () => {
  assert.deepEqual(placeCard(['a', 'b', 'c'], 'a', 2), ['b', 'c', 'a'])
})

test('a negative index puts the card first', () => {
  assert.deepEqual(placeCard(['a', 'b'], 'x', -3), ['x', 'a', 'b'])
})

test('an index past the end appends the card', () => {
  assert.deepEqual(placeCard(['a', 'b'], 'x', 99), ['a', 'b', 'x'])
})

test('dropping a card where it already is keeps the order', () => {
  assert.deepEqual(placeCard(['a', 'b', 'c'], 'b', 1), ['a', 'b', 'c'])
})

test('the card never appears twice and the input is left untouched', () => {
  const ids = ['a', 'b', 'c']
  const next = placeCard(ids, 'c', 0)
  assert.deepEqual(next, ['c', 'a', 'b'])
  assert.deepEqual(ids, ['a', 'b', 'c'])
})
