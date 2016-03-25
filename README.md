# stylelint-selector-no-mergeable

[![Build Status](https://travis-ci.org/timothyneiljohnson/stylelint-selector-no-mergeable.svg)](https://travis-ci.org/timothyneiljohnson/stylelint-selector-no-mergeable)

A [stylelint](https://github.com/stylelint/stylelint) to catch mergeable selectors.

This rule will cause stylelint to warn when you either forget to nest or nest unnecessarily.

## Installation

```
npm install stylelint-selector-no-mergeable
```

This plugin is compatible with v5.0.1+.

## Details

There are two major pieces to this plugin. Catching missed opportunities to nest rules (under-nesting), and catching over-usage of nesting (over-nesting).

Here are some examples of 'under-nesting':
```css
/* Not OK */
a .class1 {
  margin: 0
}
a .class2 {
  margin: 8px
}

/* OK */
a {
  .class1 {
    margin: 0
  }
  .class2 {
    margin: 8px
  }
}
```
```css
/* Not OK */
&.class a {
  margin: 0
}
&.class b {
  margin: 8px
}

/* OK */
&.class {
  a {
    margin: 0
  }
  b {
    margin: 8px
  }
}
```

Here is an example of 'over-nesting':

```css
a { /* Not OK */
  .class {
    margin: 0
  }
}

a .class { /* OK */
  margin: 0
}
```

If you would like to disable these 'over-nesting' errors, you can set the following option:
`allowVanityNesting`

For `allowVanityNesting: true`:

```css
a { /* OK */
  .class {
    margin: 0
  }
}
```

## Usage

Add `"stylelint-selector-no-mergeable"` to your stylelint config `plugins` array, then add `selector-no-mergeable` to your rules, with your desired options.

Example:

```js
{
  "plugins": [
    "stylelint-selector-no-mergeable"
  ],
  "rules": {
    "selector-no-mergeable": [ true, { "allowVanityNesting": true|false } ]
  }
};
```

NOTE: This plugins currently finds mergeable PARENT selectors:
```
a .class1
a .class2
```
It does NOT, unfortunately, detect mergeable chained selectors:
```
a.class1
a.class2
```
This will hopefully come in a newer release, but will require quite a bit of testing.
