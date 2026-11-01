import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scheduleEnhancements } from '../../src/scripts/enhancement-loader.ts';

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
const flush = () => new Promise((resolve) => setImmediate(resolve));

function harness({ loaded = true, fonts = Promise.resolve(), words = [] } = {}) {
  const requests = [];
  const frames = [];
  const win = new EventTarget();
  win.requestAnimationFrame = (callback) => frames.push(callback);
  const doc = {
    readyState: loaded ? 'complete' : 'loading',
    fonts: { ready: fonts },
    querySelectorAll: () => words,
    createElement: () => ({}),
    body: { append: (script) => requests.push(script) },
  };
  scheduleEnhancements(doc, win);
  return { win, requests, frames, frame: () => frames.shift()?.() };
}

test('does not request enhancements until load, fonts and a late headline reveal have painted', async () => {
  const fonts = deferred();
  const reveal = deferred();
  const h = harness({
    loaded: false,
    fonts: fonts.promise,
    words: [{ getAnimations: () => [{ finished: reveal.promise }] }],
  });
  await flush();
  assert.equal(h.frames.length, 0);
  h.win.dispatchEvent(new Event('load'));
  await flush();
  assert.equal(h.frames.length, 0);
  fonts.resolve();
  await flush();
  assert.equal(h.frames.length, 0);
  assert.equal(h.requests.length, 0);
  reveal.resolve();
  await flush();
  h.frame();
  assert.equal(h.requests.length, 0, 'the reveal needs a painted frame before fetching');
  h.frame();
  assert.deepEqual(h.requests, [{ type: 'module', src: '/client/client.js' }]);
  h.win.dispatchEvent(new Event('load'));
  await flush();
  assert.equal(h.frames.length, 0, 'load must not install another scheduler');
});

test('cancelling the headline for reduced motion does not strand enhancements', async () => {
  const reveal = deferred();
  const h = harness({ words: [{ getAnimations: () => [{ finished: reveal.promise }] }] });
  await flush();
  reveal.reject(new Error('animation cancelled'));
  await flush();
  h.frame();
  h.frame();
  assert.equal(h.requests.length, 1);
});

test('pages without a headline reveal still wait for fonts and paint', async () => {
  const fonts = deferred();
  const h = harness({ fonts: fonts.promise });
  await flush();
  assert.equal(h.frames.length, 0);
  fonts.resolve();
  await flush();
  h.frame();
  assert.equal(h.requests.length, 0);
  h.frame();
  assert.equal(h.requests.length, 1);
});

test('a browser without getAnimations can use the static headline fallback', async () => {
  const h = harness({ words: [{}] });
  await flush();
  h.frame();
  h.frame();
  assert.equal(h.requests.length, 1);
});
