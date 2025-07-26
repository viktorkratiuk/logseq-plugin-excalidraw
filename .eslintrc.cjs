module.exports = {
  extends: [require.resolve('@haydenull/fabric/eslint/react')],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off', // TypeScript provides prop type checking
  }
}