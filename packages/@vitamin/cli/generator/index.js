module.exports = (api, options = {}) => {
  console.log('api, options: ', api, options)
  // api.render('./template', {})

  // api.extendPackage({
  //   scripts: {
  //   },
  //   browserslist: [
  //     '> 1%',
  //     'last 2 versions',
  //     'not dead',
  //     ...(options.vueVersion === '3' ? ['not ie 11'] : [])
  //   ]
  // })

  // // additional tooling configurations
  // if (options.configs) {
  //   api.extendPackage(options.configs)
  // }

  // // Delete jsconfig.json when typescript
  // if (api.hasPlugin('typescript')) {
  //   api.render((files) => delete files['jsconfig.json'])
  // }
}
