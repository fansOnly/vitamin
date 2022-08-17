exports.getPromptModules = () => {
  return []
  return [
    'vueVersion',
    'typescript',
    'linter'
  ].map(file => require(`../promptModules/${file}`))
}
