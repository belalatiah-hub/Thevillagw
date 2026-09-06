/* Find Playwright wherever this is running.
 *
 * The browser suites were written in a dev container that ships Playwright at
 * a fixed absolute path, and requiring it by that path works there and
 * nowhere else — a CI runner that installs it normally would fail on the
 * first line, before any test had a chance to say anything useful.
 *
 * So: the ordinary resolution first, the container's copy as a fallback, and
 * an error that says what to do if neither is there.
 */
const CANDIDATES = ['playwright', '/opt/node22/lib/node_modules/playwright'];

module.exports = (function () {
  const tried = [];
  for (const p of CANDIDATES) {
    try {
      return require(p);
    } catch (e) {
      tried.push(p);
    }
  }
  throw new Error(
    'playwright not found (tried: ' + tried.join(', ') + ').\n' +
    'Install it with:  npx playwright install --with-deps chromium');
})();
