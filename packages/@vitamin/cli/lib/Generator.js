const debug = require('debug')
const inquirer = require('inquirer')
const sortObject = require('./util/sortObject')
const { getTemplateList, downloadTemplate } = require('./util/remoteTemplateInfo')

module.exports = class Generator {
  constructor(context, {
    pkg = {},
  } = {}) {
    this.context = context
    this.originalPkg = pkg
    this.pkg = Object.assign({}, pkg)
  }

  async generate({
    sortPackageJson = false
  } = {}) {
    // 1. get templates from github remote or use local template
    // const templates = await getTemplateList()
    // console.log('templates: ', templates);
    
    // 2. choose a template
    const { action } = await inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        message: `Choose a template to use:`,
        choices: [
          { name: 'uniapp template with Custom UI (for Mini Programs and H5)', value: 'uniapp-custom' },
          { name: 'uniapp template with Uni UI (for all platforms)', value: 'uniapp-uni' },
          { name: 'uniapp template with Vant UI(for Mini Programs)', value: 'uniapp-vant' }
        ]
      }
    ])

    // 3. download template
    await downloadTemplate(this.pkg, 'fansOnly/uni-template')

    // set package.json
    if (sortPackageJson) {
      this.sortPkg()
    }
  }

  sortPkg() {
    // ensure package.json keys has readable order
    this.pkg.dependencies = sortObject(this.pkg.dependencies)
    this.pkg.devDependencies = sortObject(this.pkg.devDependencies)
    this.pkg.scripts = sortObject(this.pkg.scripts, [
      'serve',
      'build',
      // 'test:unit',
      // 'test:e2e',
      'lint',
    ])
    this.pkg = sortObject(this.pkg, [
      'name',
      'version',
      'private',
      'description',
      'author',
      'scripts',
      'main',
      'module',
      'browser',
      'jsDelivr',
      'unpkg',
      'files',
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'vue',
      'babel',
      'eslintConfig',
      'prettier',
      'postcss',
      'browserslist',
      'jest'
    ])

    debug('vitamin:cli-pkg')(this.pkg)
  }
}
