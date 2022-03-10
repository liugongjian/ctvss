module.exports = {
extends: [
  "stylelint-config-standard",
  "stylelint-config-recommended-vue"
],
  rules:{
  "selector-class-pattern":"^[a-z-_0-9]+$",
  "at-rule-no-unknown": [
    true,
    {
    ignoreAtRules: [
          "mixin"
                  ],
    }],
  "color-function-notation": "legacy"
}
  }