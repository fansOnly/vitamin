module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    requireConfigFile: false,
    babelOptions: {
      babelrc: false,
      configFile: false,
    },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: ['plugin:vue/recommended', 'eslint:recommended', 'prettier'],

  // add your custom rules here
  // it is base on https://github.com/vuejs/eslint-config-vue
  rules: {
    // vue
    'vue/no-v-html': 'off',
    'vue/no-v-text-v-html-on-component': 'error',
    // Require component names to be always multi-word
    // prefer name: 'todo-item', not name: 'Todo'
    'vue/multi-word-component-names': 'error',
    // Disallow using arrow functions to define watcher
    'vue/no-arrow-functions-in-watch': 'error',
    // Disallow duplication of field names
    'vue/no-dupe-keys': 'error',
    // Disallow mutation of component props
    'vue/no-mutating-props': 'error',
    // Disallow unused variable definitions of v-for directives or scope attributes
    'vue/no-unused-vars': ['warn', { ignorePattern: '^_' }],
    /**
     * Enforce order of properties in components --fix
     * 1. name
     * 2. compilerOptions
     * 3. components / directives
     * 4. extends / mixins / provide/inject
     * 5. inheritAttrs / props / emits
     * 6. setup
     * 7. data / computed
     * 8. watch
     * 9. beforeCreate -> created -> beforeMount -> mounted -> beforeUpdate -> updated ->
     * activated -> deactivated -> beforeUnmount -> unmounted ->
     * errorCaptured -> renderTracked -> renderTriggered
     * 10. methods
     * 11. template/render
     */
    'vue/order-in-components': 'error',
    // Enforce order of component top-level elements --fix
    'vue/component-tags-order': [
      'error',
      { order: [['script', 'template'], 'style'] },
    ],
    // Enforce order of attributes --fix
    'vue/attributes-order': [
      'error',
      {
        order: [
          'DEFINITION',
          'LIST_RENDERING',
          'CONDITIONALS',
          'RENDER_MODIFIERS',
          'GLOBAL',
          ['UNIQUE', 'SLOT'],
          'TWO_WAY_BINDING',
          'OTHER_DIRECTIVES',
          'OTHER_ATTR',
          'EVENTS',
          'CONTENT',
        ],
        alphabetical: false,
      },
    ],
    // Enforce attribute naming style on custom components in template --fix
    'vue/attribute-hyphenation': ['error', 'always'],
    // Enforce specific casing for component definition name  --fix
    'vue/component-definition-name-casing': ['error', 'kebab-case'],
    // Enforce the location of first attribute --fix
    'vue/first-attribute-linebreak': [
      'error',
      { singleline: 'ignore', multiline: 'below' },
    ],
    // Enforce the maximum number of attributes per line  --fix
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 10,
        multiline: {
          max: 2,
        },
      },
    ],
    // Require or disallow a line break before tag's closing brackets
    'vue/html-closing-bracket-newline': [
      'error',
      {
        singleline: 'never',
        multiline: 'always',
      },
    ],
    // Enforce end tag style  --fix
    'vue/html-end-tags': 'error',
    // Enforce quotes style of HTML attributes
    'vue/html-quotes': ['error', 'double', { avoidEscape: false }],
    // Disallow multiple spaces  --fix
    'vue/no-multi-spaces': ['error'],
    // Disallow spaces around equal signs in attribute  --fix
    'vue/no-spaces-around-equal-signs-in-attribute': ['error'],
    // Enforce specific casing for the Prop name in Vue components
    'vue/prop-name-casing': ['error', 'camelCase'],
    // Require default value for props
    'vue/require-default-prop': 'off',
    // Require type definitions in props
    'vue/require-prop-types': 'error',
    // Enforce v-bind directive style  --fix
    // prefer :prop="val", not v-bind:prop="val"
    'vue/v-bind-style': ['error', 'shorthand'],
    // Enforce specific casing for custom event name
    'vue/custom-event-name-casing': ['error', 'kebab-case'],

    // js
    // 要求使用骆驼拼写法
    camelcase: ['error', { properties: 'never' }],
    'no-unused-vars': 'warn',
    // 禁止末尾逗号 --fix
    'comma-dangle': ['off', 'never'],
    // 强制在逗号前后使用一致的空格 --fix
    'comma-spacing': ['error', { before: false, after: true }],
    // 逗号风格: 要求逗号放在数组元素、对象属性或变量声明之后，且在同一行 --fix
    'comma-style': 'error',
    'no-return-await': 'error',
    // 两个空格 --fix
    indent: ['error', 2],
    // 强制所有不包含双引号的 JSX 属性值使用双引号 --fix
    'jsx-quotes': ['error', 'prefer-double'],
    /**
     * 强制在对象字面量的键和值之间使用一致的空格 --fix
     * 1. 禁止在对象字面量的键和冒号之间存在空格
     * 2. 要求在对象字面量的冒号和值之间存在至少有一个空格
     */
    'key-spacing': 'error',
    /**
     * 强制关键字周围空格的一致性 --fix
     * 1. 要求在关键字之前至少有一个空格
     * 2. 要求在关键字之后至少有一个空格
     */
    'keyword-spacing': ['error', { before: true, after: true }],
    // 限制函数定义中最大参数个数 - 3
    'max-params': ['error', { max: 3 }],
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 禁止出现多个空格 --fix
    'no-multi-spaces': 'error',
    // 多个空行 --fix
    'no-multiple-empty-lines': ['error', { max: 2 }],
    // 禁止在 return 语句中使用赋值语句
    'no-return-assign': 'error',
    'no-sequences': 'error', // 禁用逗号操作符
    // 禁止在函数标识符和其调用之间有空格 --fix
    'func-call-spacing': 'error',
    // 禁用行尾空白 --fix
    'no-trailing-spaces': 'error',
    // 不允许初始化变量值为 undefined --fix
    'no-undef-init': 'error',
    // 禁止可以表达为更简单结构的三元操作符 --fix
    'no-unneeded-ternary': 'error',
    // 禁止在对象中使用不必要的计算属性 --fix
    'no-useless-computed-key': 'error',
    // 禁止属性前有空白 --fix
    'no-whitespace-before-property': 'error',
    // 强制函数中的变量在一起声明或分开声明 // --fix
    'one-var': ['error', { initialized: 'never' }],
    'operator-linebreak': [
      'error',
      'after',
      { overrides: { '?': 'before', ':': 'before' } },
    ], // --fix
    // 禁止块内填充 --fix
    'padded-blocks': ['error', 'never'],
    // 单引号 --fix
    quotes: ['error', 'single'],
    // 禁止使用分号代替 ASI --fix
    semi: ['error', 'never'],
    // 强制分号前后有空格 --fix
    'semi-spacing': ['error', { before: false, after: true }],
    // 要求语句块之前的空格 --fix
    'space-before-blocks': ['error', 'always'],
    // 要求或禁止函数圆括号之前有一个空格 --fix
    'space-before-function-paren': [
      'error',
      { anonymous: 'always', named: 'never', asyncArrow: 'always' },
    ],
    // 禁止圆括号内的空格 --fix
    'space-in-parens': 'error',
    // 要求中缀操作符周围有空格 --fix
    'space-infix-ops': 'error',
    // 要求在一元操作符之前或之后存在空格 --fix
    'space-unary-ops': ['error', { words: true, nonwords: false }],
    // 要求在注释前有空白 (space 或 tab) --fix
    'spaced-comment': [
      'error',
      'always',
      {
        markers: [
          'global',
          'globals',
          'eslint',
          'eslint-disable',
          '*package',
          '!',
          ',',
        ],
      },
    ],
    yoda: ['error', 'never'], // 禁止Yoda条件 --fix
    'prefer-const': 'error', // 建议使用const --fix
    // 强制在花括号中使用一致的空格 --fix
    'object-curly-spacing': ['error', 'always', { objectsInObjects: false }],
    // 禁止或强制在括号内使用空格 --fix
    'array-bracket-spacing': [
      'error',
      'never',
      { objectsInArrays: true, arraysInArrays: true },
    ],
  },
}
