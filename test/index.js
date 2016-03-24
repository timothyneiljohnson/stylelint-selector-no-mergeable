const ruleTester = require('stylelint-rule-tester');
var selectorNoMergeable = require('..');

const testRule = ruleTester(selectorNoMergeable.rule, selectorNoMergeable.ruleName);
const mergeableError = 'Merge with rule found on line 1 (selector-no-mergeable)';

const basics = (tr) => {
  tr.ok('');
  tr.ok('a {}');
  tr.ok('@import "foo.css";');
  tr.ok('a { top: 0; }');
};

testRule(true, (tr) => {
  basics(tr);
  // Catch identical selectors
  tr.notOk('a { margin: 10px; } a { text-transform: uppercase; }', mergeableError);
  tr.ok('a { margin: 10px; text-transform: uppercase; }');
  // --- Avoid comparison when comma present
  tr.ok('.class .active { top: 0; } .class, class .inactive { top: 0; }');
  // --- Ignore combinator spacing differences
  tr.notOk('span>.class { top: 0; } span > .class { top: 0; }', mergeableError);

  // Catch nestable selectors
  tr.ok('h1 { color: #fff; &.new { color: #000; }}');
  // --- Consider '&' vs. '& '
  tr.ok('&.class { top: 0; } & .class { top: 0; }');
  tr.notOk('>.class .active { top: 0; } >.class .inactive { top: 0; }', mergeableError);
  tr.notOk('& .class .active { top: 0; } & .class { top: 0; }', mergeableError);

  // Catch vanity nesting
  tr.notOk('a { .class { margin: 0; }}', 'Avoid unnecessary nesting (selector-no-mergeable)');
  tr.ok('a .class { margin: 0; }');
  tr.ok('.flexText-btn { .btn { @include flex-text($screen-sm, $ft-xxs); } @include breakpoint(md) { .btn { @include flex-text($screen-md, $ft-xxs); }}}');
});

testRule(true, { allowVanityNesting: true }, (tr) => {
  basics(tr);

  // Allow vanity nesting
  tr.ok('a { .class { margin: 0; }}');
});
