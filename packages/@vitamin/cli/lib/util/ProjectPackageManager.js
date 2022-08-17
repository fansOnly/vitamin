const stripAnsi = require('strip-ansi')
const minimist = require('minimist')
const { executeCommand } = require('./executeCommand')

const {
  chalk,
  execa,

  hasProjectYarn,
  hasProjectPnpm,
  hasProjectNpm,

  hasYarn,
  hasPnpm3OrLater,
  hasPnpmVersionOrLater
} = require('@vue/cli-shared-utils')

const SUPPORTED_PACKAGE_MANAGERS = ['yarn', 'pnpm', 'npm']
const PACKAGE_MANAGER_PNPM4_CONFIG = {
  install: ['install', '--reporter', 'silent', '--shamefully-hoist'],
  add: ['install', '--reporter', 'silent', '--shamefully-hoist'],
  upgrade: ['update', '--reporter', 'silent'],
  remove: ['uninstall', '--reporter', 'silent']
}
const PACKAGE_MANAGER_PNPM3_CONFIG = {
  install: ['install', '--loglevel', 'error', '--shamefully-flatten'],
  add: ['install', '--loglevel', 'error', '--shamefully-flatten'],
  upgrade: ['update', '--loglevel', 'error'],
  remove: ['uninstall', '--loglevel', 'error']
}
const PACKAGE_MANAGER_CONFIG = {
  npm: {
    install: ['install', '--loglevel', 'error'],
    add: ['install', '--loglevel', 'error'],
    upgrade: ['update', '--loglevel', 'error'],
    remove: ['uninstall', '--loglevel', 'error']
  },
  pnpm: hasPnpmVersionOrLater('4.0.0') ? PACKAGE_MANAGER_PNPM4_CONFIG : PACKAGE_MANAGER_PNPM3_CONFIG,
  yarn: {
    install: [],
    add: ['add'],
    upgrade: ['upgrade'],
    remove: ['remove']
  }
}

class PackageManager {
  constructor({ context, forcePackageManager } = {}) {
    this.context = context || process.cwd()
    this._registries = {}

    if (forcePackageManager) {
      this.bin = forcePackageManager
    } else if (context) {
      if (hasProjectYarn(context)) {
        this.bin = 'yarn'
      } else if (hasProjectPnpm(context)) {
        this.bin = 'pnpm'
      } else if (hasProjectNpm(context)) {
        this.bin = 'npm'
      }
    }

    // if no package managers specified, and no lockfile exists
    if (!this.bin) {
      this.bin = hasYarn() ? 'yarn' : hasPnpm3OrLater() ? 'pnpm' : 'npm'
    }

    if (this.bin === 'npm') {
      // npm doesn't support package aliases until v6.9
      const MIN_SUPPORTED_NPM_VERSION = '6.9.0'
      const npmVersion = stripAnsi(execa.sync('npm', ['--version'].stdout))

      if (semver.lt(npmVersion, MIN_SUPPORTED_NPM_VERSION)) {
        throw new Error(
          'You are using an outdated version of NPM.\n' +
          'It does not support some core functionalities of Vue CLI.\n' +
          'Please upgrade your NPM version.'
        )
      }

      if (semver.gte(npmVersion, '7.0.0')) {
        this.needsPeerDepsFix = true
      }
    }

    if (!SUPPORTED_PACKAGE_MANAGERS.includes(this.bin)) {
      log()
      warn(
        `The package manager ${chalk.red(this.bin)} is ${chalk.red('not officially supported')}.\n` +
        `It will be treated like ${chalk.cyan('npm')}, but compatibility issues may occur.\n` +
        `See if you can use ${chalk.cyan('--registry')} instead.`
      )
      PACKAGE_MANAGER_CONFIG[this.bin] = PACKAGE_MANAGER_CONFIG.npm
    }
  }

  async runCommand(command, args) {
    const preNodeEnv = process.env.NODE_ENV
    // In the use case of CLI, when installing dependencies,
    // the `NODE_ENV` environment variable does no good;
    // it only confuses users by skipping dev deps (when set to `production`).
    delete process.env.NODE_ENV

    await this.setRegistryEnvs()
    await executeCommand(
      this.bin,
      [
        ...PACKAGE_MANAGER_CONFIG[this.bin][command],
        ...(args || [])
      ],
      this.context
    )

    if (preNodeEnv) {
      process.env.NODE_ENV = prevNodeEnv
    }
  }

  async install() {
    const args = []
    return await this.runCommand('install', args)
  }

  async setRegistryEnvs() {
    const registry = await this.getRegistry()
    
    process.env.npm_config_registry = registry
    process.env.YARN_NPM_REGISTRY_SERVER = registry
  }

  async getRegistry(scope) {
    const cacheKey = scope || ''
    if (this._registries[cacheKey]) {
      return this._registries[cacheKey]
    }

    const args = minimist(process.argv, {
      alias: {
        r: 'registry'
      }
    })

    let registry

    if (args.registry) {
      registry = args.registry
    } else {
      try {
        if (scope) {
          registry = (await execa(this.bin, ['config', 'get', scope + ':registry'])).stdout
        }
        if (!registry || registry === 'undefined') {
          registry = (await execa(this.bin, ['config', 'get', 'registry'])).stdout
        }
      } catch (error) {
        // Yarn 2 uses `npmRegistryServer` instead of `registry`
        registry = (await execa(this.bin, ['config', 'get', 'npmRegistryServer'])).stdout
      }
    }

    this._registries[cacheKey] = stripAnsi(registry).trim()
    return this._registries[cacheKey]
  }
}

module.exports = PackageManager
