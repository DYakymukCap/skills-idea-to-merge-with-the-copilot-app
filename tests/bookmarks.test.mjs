import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBookmark,
  normalizeUrl,
  parseStoredBookmarks,
} from '../src/lib/bookmarks.mjs';

test('URLs with and without https normalize to the same saved value', () => {
  assert.equal(normalizeUrl('https://www.example.com'), 'https://www.example.com/');
  assert.equal(normalizeUrl('www.example.com'), 'https://www.example.com/');
});

test('empty storage recovers to an empty list', () => {
  assert.deepEqual(parseStoredBookmarks(null), []);
  assert.deepEqual(parseStoredBookmarks(''), []);
});

test('corrupted and legacy storage recovers without throwing', () => {
  assert.deepEqual(parseStoredBookmarks('{not-json'), []);
  assert.deepEqual(parseStoredBookmarks('["legacy-string"]'), []);
  assert.deepEqual(parseStoredBookmarks('{"url":"https://example.com"}'), []);
});

test('non-array stored values recover to an empty list', () => {
  assert.deepEqual(parseStoredBookmarks('42'), []);
  assert.deepEqual(parseStoredBookmarks('"https://example.com"'), []);
});

test('malformed array entries are dropped', () => {
  const stored = JSON.stringify([
    { url: 'https://example.com', slug: 'mona-7fk2' },
    { url: 'not a valid url', slug: 'mona-bad' },
    { url: 'https://example.org' },
  ]);
  assert.deepEqual(parseStoredBookmarks(stored), [
    { url: 'https://example.com/', slug: 'mona-7fk2' },
  ]);
});

test('saved bookmark formatting uses exact separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com/', slug: 'mona-7fk2' }),
    'https://www.example.com/ :: mona-7fk2',
  );
});
