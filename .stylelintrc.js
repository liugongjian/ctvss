module.exports={
  extends: [
    "stylelint-config-standard",
    "stylelint-config-recommended-vue"
  ],
  rules:{
    "selector-class-pattern":"^[a-z-_0-9]+$",
    // @mixin
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "mixin",
          "include"
        ],
      }],
    "declaration-block-no-redundant-longhand-properties": [true,{ignoreShorthands:["grid-template"]} ],
    "color-function-notation": "legacy",
    "selector-pseudo-element-colon-notation": "single",
    "string-quotes": "single",
    "keyframes-name-pattern": "^[a-z-_0-9]+$",
    "no-descending-specificity": null
  }
}
