const axios = require('axios')

/**
 * 获取模板
 */
exports.getTemplateList = function () {
  // TODO
  return axios.get('https://api.github.com/users/fansOnly/repos')
}

/**
 * 下载模板
 * @param {object} pkg
 * @param {string} repository
 * @param {boolean} [clone = false]
 */
exports.downloadTemplate = async function (pkg, repository, clone = false) {
  const path = require('path')
  const download = require('download-git-repo')

  const tmpdir = path.join(process.cwd(), pkg.name)

  await new Promise((resolve, reject) => {
    download(repository, tmpdir, { clone }, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}
