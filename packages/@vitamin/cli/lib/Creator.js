const debug = require('debug')
const inquirer = require('inquirer')
const EventEmitter = require('events')
const Generator = require('./Generator')
const PromptModuleAPI = require('./PromptModuleAPI')
const PackageManager = require('./util/ProjectPackageManager')
const { clearConsole } = require('./util/clearConsole')
const writeFileTree = require('./util/writeFileTree')
const {
  chalk,
  log,

  hasYarn,
  hasPnpm3OrLater,
  hasPnpmVersionOrLater,

  resolvePkg,
  execa,
} = require('@vue/cli-shared-utils')

// 手动选择配置
const isManualMode = (answers) => answers.preset === '__manual__'

module.exports = class Creator extends EventEmitter {
  constructor(name, context, promptModules) {
    super()

    this.name = name
    this.context = process.env.VITAMIN_CLI_CONTEXT = context
    const { presetPrompt, featurePrompt } = this.resolveIntroPrompts()

    this.presetPrompt = presetPrompt
    this.featurePrompt = featurePrompt
    this.outroPrompts = this.resolveOutroPrompts()
    this.injectedPrompts = []

    const promptAPI = new PromptModuleAPI(this)
    promptModules.forEach((m) => m(promptAPI))
  }

  async create(cliOptions = {}, preset = null) {
    const { name, context } = this

    const packageManager =
      cliOptions.packageManager ||
      (hasYarn() ? 'yarn' : null) ||
      (hasPnpm3OrLater() ? 'pnpm' : 'npm')

    await clearConsole()
    const pm = new PackageManager({
      context,
      forcePackageManager: packageManager,
    })

    log(`✨  Creating project in ${chalk.yellow(context)}.`)
    this.emit('creation', { event: 'creating' })

    // generate package.json with plugin dependencies
    const pkg = {
      name,
      version: '1.0.0',
      private: true,
      devDependencies: {},
      ...resolvePkg(context),
    }

    // write package.json
    await writeFileTree(context, {
      'package.json': JSON.stringify(pkg, null, 2),
    })

    // generate a .npmrc file for pnpm, to persist the `shamefully-flatten` flag
    if (packageManager === 'pnpm') {
      const pnpmConfig = hasPnpmVersionOrLater('4.0.0')
        ? 'shamefully-hoist=true\n'
        : 'shamefully-flatten=true\n'

      await writeFileTree(context, {
        '.npmrc': pnpmConfig,
      })
    }

    // install plugins - skip over
    // log(`⚙\u{fe0f}  Installing CLI plugins. This might take a while...`)
    // log()
    // this.emit('creation', { event: 'plugins-install' })

    // run generator
    log('🚀  Invoking generators...')
    this.emit('creation', { event: 'invoking-generators' })
    const generator = new Generator(context, {
      pkg,
    })
    await generator.generate()

    // install additional deps (injected by generators)
    log('📦  Installing additional dependencies...')
    this.emit('creation', { event: 'deps-install' })
    log()
    await pm.install()

    // run complete cbs if any (injected by generators)
    log('⚓  Running completion hooks...')
    this.emit('creation', { event: 'completion-hooks' })

    // log instructions
    log()
    log(`🎉  Successfully created project ${chalk.yellow(name)}.`)
    if (!cliOptions.skipGetStarted) {
      log(
        '👉  Get started with the following commands:\n\n' +
          (this.context === process.cwd()
            ? ''
            : chalk.cyan(` ${chalk.gray('$')} cd ${name}\n`)) +
          chalk.cyan(
            ` ${chalk.gray('$')} ${
              packageManager === 'yarn'
                ? 'yarn serve'
                : packageManager === 'pnpm'
                ? 'pnpm run serve'
                : 'npm run serve'
            }`
          )
      )
    }
    log()
    this.emit('creation', { event: 'done' })

    // generator.printExitLogs()
  }

  run(command, args) {
    if (!args) {
      ;[command, ...args] = command.split(/\s+/)
    }
    return execa(command, args, { cwd: this.context })
  }

  async promptAndResolvePreset(answers = null) {
    // prompt
    if (!answers) {
      await clearConsole(true)
      answers = await inquirer.prompt(this.resolveFinalPrompts())
    }
    debug('vitamin-cli:answers')(answers)

    // TODO set .vitaminrc
    // if (answers.packageManager) {
    //   saveOptions({
    //     packageManager: answers.packageManager
    //   })
    // }

    let preset
    if (answers.preset && answers.preset !== '__manual__') {
      preset = await this.resolvePreset(answers.preset)
    } else {
      // manual
      preset = {
        useConfigFiles: answers.useConfigFiles === 'files',
        plugins: {},
      }
      answers.features = answers.features || []
      // run cb registered by prompt modules to finalize the preset
      this.promptCompleteCbs.forEach((cb) => cb(answers, preset))
    }

    // TODO validate preset

    // TODO save preset
    // if (answers.save && answers.saveName && savePreset(answers.saveName, preset)) {
    //   log()
    //   log(`🎉  Preset ${chalk.yellow(answers.saveName)} saved in ${chalk.yellow(rcPath)}`)
    // }

    debug('vitamin-cli:preset')(preset)
    return preset
  }

  async resolvePreset(name, clone) {
    let preset

    return preset
  }

  resolveIntroPrompts() {
    // 忽略预设 presets

    const presetPrompt = {
      name: 'preset',
      type: 'list',
      message: 'Please pick a preset:',
      choices: [
        {
          name: 'Manually select features',
          value: '__manual__',
        },
      ],
    }
    const featurePrompt = {
      name: 'features',
      when: isManualMode,
      type: 'checkbox',
      message: 'Check the features needed for your project:',
      choices: [],
      pageSize: 10,
    }

    return {
      presetPrompt,
      featurePrompt,
    }
  }

  resolveOutroPrompts() {
    const outroPrompts = [
      {
        name: 'useConfigFiles',
        when: isManualMode,
        type: 'list',
        message: 'Where do you prefer placing config for Babel, ESLint, etc.?',
        choices: [
          {
            name: 'In dedicated config files',
            value: 'files',
          },
          {
            name: 'In package.json',
            value: 'pkg',
          },
        ],
      },
    ]

    // ask for packageManager once
    if (hasYarn() || hasPnpm3OrLater()) {
      const packageManagerChoices = []

      if (hasYarn()) {
        packageManagerChoices.push({
          name: 'Use Yarn',
          value: 'yarn',
          short: 'Yarn',
        })
      }

      if (hasPnpm3OrLater()) {
        packageManagerChoices.push({
          name: 'Use PNPM',
          value: 'pnpm',
          short: 'PNPM',
        })
      }

      packageManagerChoices.push({
        name: 'Use NPM',
        value: 'npm',
        short: 'NPM',
      })

      outroPrompts.push({
        name: 'packageManager',
        type: 'list',
        message:
          'Pick the package manager to use when installing dependencies:',
        choices: packageManagerChoices,
      })
    }

    return outroPrompts
  }

  resolveFinalPrompts() {
    // patch generator-injected prompts to only show in manual mode
    this.injectedPrompts.forEach((prompt) => {
      const originalWhen = prompt.when || (() => true)
      prompt.when = (answers) => {
        return isManualMode(answers) && originalWhen(answers)
      }
    })

    const prompts = [
      this.presetPrompt,
      this.featurePrompt,
      ...this.injectedPrompts,
      ...this.outroPrompts,
    ]
    debug('vitamin-cli:prompts')(prompts)
    return prompts
  }
}
