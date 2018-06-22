'use strict';

const assign = require('object-assign');
const stylelint = require('stylelint');
const ruleName = 'selector-no-mergeable/selector-no-mergeable';
const messages = stylelint.utils.ruleMessages(ruleName, {});

const arrayContains = (searchItem, array) =>
  array.indexOf(searchItem) > -1;

module.exports = stylelint.createPlugin(ruleName, (enabled, options) =>
  (root, result) => {
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {
      actual: enabled,
      possible: [true, false]
    }, {
      actual: options,
      possible: {
        allowVanityNesting: [true, false]
      },
      optional: true
    });

    const opts = options || {};
    let mergeableLineArray = [];

    const unpadCombinators = (string) =>
      string.replace(/\s\s+/g, ' ').replace(/\s*([>\+~])\s*/g, '$1');

    const evaluateMergeableSelector = (rule) => {
      let childNodeLine = 0;
      let exists = false;

      // Look for duplicate selector
      rule.parent.nodes.forEach(childNode => {
        if (childNode !== rule && childNode.type === 'rule' &&
          unpadCombinators(rule.selectors.sort().join(',')) === unpadCombinators(childNode.selectors.sort().join(','))) {
          childNodeLine = childNode.source.start.line;
          mergeableLineArray.push(childNodeLine);
          exists = true;
        }
      });

      // Look for nestable selector
      if (!exists && rule.selector.indexOf(',') <= -1) {
        rule.parent.nodes.forEach(childNode => {
          const unpaddedSelector = unpadCombinators(rule.selector.trim());
          const firstTerm = unpaddedSelector.split(' ')[0];
          const secondTerm = unpaddedSelector.split(' ')[1];

          if (childNode !== rule && childNode.type === 'rule' && childNode.selector.indexOf(',') <= -1) {
            const peerUnpaddedSelector = unpadCombinators(childNode.selector.trim());
            const peerFirstTerm = peerUnpaddedSelector.split(' ')[0];
            const peerSecondTerm = peerUnpaddedSelector.split(' ')[1];

            if (firstTerm === peerFirstTerm &&
              (firstTerm !== '&' || (firstTerm === '&' && secondTerm === peerSecondTerm))) {
              childNodeLine = childNode.source.start.line;
              mergeableLineArray.push(childNodeLine);
              exists = true;
            }
          }
        });
      }
      return { exists: exists, line: childNodeLine };
    };

    const hasStyles = (parentNode) =>
      parentNode.nodes.some(node => node.type === 'decl');

    const hasSiblingRules = (node) =>
      node.parent.nodes.some(childNode =>
        childNode !== node && (childNode.type === 'rule' || childNode.type === 'atrule'));

    const checkForVanityNesting = (rule) => {
      const parentNode = rule.parent;
      if (parentNode !== root &&
        parentNode.type === 'rule' &&

        rule.selector.indexOf(',') <= -1 &&
        parentNode.selector.indexOf(',') <= -1 &&
        !hasStyles(parentNode) &&
        !hasSiblingRules(rule)) {
        messages.rejected = `Avoid unnecessary nesting (${ruleName})`;
        stylelint.utils.report({
          ruleName: ruleName,
          result: result,
          node: rule,
          message: messages.rejected
        });
      }
    };

    const checkForMergeableSelector = (rule) => {
      if (arrayContains(rule.source.start.line, mergeableLineArray)) { return; }

      // Catch duplicate and nestable selectors
      // -- allow for @mixin, @include, etc.
      const mergeableSelector = evaluateMergeableSelector(rule);

      if (mergeableSelector.exists) {
        stylelint.utils.report({
          ruleName: ruleName,
          result: result,
          node: rule,
          message: `Merge with rule found on line ${mergeableSelector.line} (${ruleName})`
        });
      }

      // Catch vanity nesting
      if (!opts.allowVanityNesting) {
        checkForVanityNesting(rule);
      }
    };

    if (!validOptions) {
      return;
    }

    root.walkRules(checkForMergeableSelector);
  }
);

module.exports.ruleName = ruleName;
module.exports.messages = messages;
