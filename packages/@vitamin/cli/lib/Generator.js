const path = require('path')
const fs = require('fs-extra')
const ejs = require('ejs')
const debug = require('debug')
const inquirer = require('inquirer')
const sortObject = require('./util/sortObject')
const {
  getTemplateList,
  downloadTemplate,
} = require('./util/remoteTemplateInfo')

module.exports = class Generator {
  constructor(context, { pkg = {} } = {}) {
    this.context = context
    this.originalPkg = pkg
    this.pkg = Object.assign({}, pkg)
  }

  async generate({ sortPackageJson = false } = {}) {
    // 1. choose a github template or local template
    const templateChoice = await inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        message: 'Choose a template type:',
        choices: [
          { name: 'from local(auto template)', value: 'local' },
          { name: 'from github', value: 'github' },
        ],
      },
    ])

    if (templateChoice.action === 'local') {
      await this.useLocalTemplate()
    } else {
      await this.useRemoteTemplate()
    }

    // set package.json
    if (sortPackageJson) {
      this.sortPkg()
    }
  }

  useLocalTemplate() {
    const templateDir = path.join(__dirname, '../generator/template')
    const outputPath = `${process.cwd()}/${this.pkg.name}`
    this.copyAllFiles(templateDir, outputPath)
  }

  async copyAllFiles(dir, output) {
    const files = await fs.readdir(dir)
    files.forEach((file) => {
      const filePath = path.join(dir, file)
      const outputPath = path.join(output, file)
      if (fs.statSync(filePath).isDirectory()) {
        fs.ensureDirSync(outputPath)
        this.copyAllFiles(filePath, outputPath)
      } else {
        ejs.renderFile(filePath).then((data) => {
          fs.writeFileSync(outputPath, data)
        })
      }
    })
  }

  async useRemoteTemplate() {
    // 2. get templates from github remote or use local template
    // const templates = await getTemplateList()
    // console.log('templates: ', templates);
    const templates = [
      {
        name: 'uniapp template with Custom UI (for Mini Programs and H5)',
        value: 'uniapp-custom',
      },
      {
        name: 'uniapp template with Uni UI (for all platforms)',
        value: 'uniapp-uni',
      },
      {
        name: 'uniapp template with Vant UI(for Mini Programs)',
        value: 'uniapp-vant',
      },
    ]

    // 3. choose a template
    const { action } = await inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        message: 'Choose a template to use:',
        choices: templates,
      },
    ])

    console.log('用户选择的模板为：', action)

    // 4. download template
    await downloadTemplate(this.pkg, 'fansOnly/uni-template')
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
      'jest',
    ])

    debug('vitamin:cli-pkg')(this.pkg)
  }
}
