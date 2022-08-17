const { semver } = require('@vue/cli-shared-utils')

let sessionCached
let latestVersion
let lastChecked = 0

module.exports = async function getVersions() {
  if (sessionCached) return sessionCached

  let latest
  const local = require('../../package.json').version

  // TODO get from .vitaminrc
  // const { latestVersion = local, lastChecked = 0 } = loadOptions()
  latestVersion = local
  const cached = latestVersion
  const daysPassed = (Date.now() - lastChecked) / (60 * 60 * 1000 * 24)

  let error
  if (daysPassed > 1) {
    // if we haven't check for a new version in a day, wait for the check
    // before proceeding
    try {
      latest = await getAndCacheLatestVersion(cached)
    } catch (e) {
      latest = cached
      error = e
    }
  } else {
    // Otherwise, do a check in the background. If the result was updated,
    // it will be used for the next 24 hours.
    // don't throw to interrupt the user if the background check failed
    getAndCacheLatestVersion(cached).catch(() => { })
    latest = cached
  }

  // if the installed version is updated but the cache doesn't update
  if (semver.gt(latest, local)) {
    latest = local
  }

  let latestMinor = `${semver.major(latest)}.${semver.minor(latest)}.0`
  if (
    // if the latest version contains breaking changes
    /major/.test(semver.diff(local, latest)) ||
    // or if using `next` branch of cli
    (semver.gte(local, latest) && semver.prerelease(local))
  ) {
    // fallback to the local cli version number
    latestMinor = local
  }

  return (sessionCached = {
    current: local,
    latest,
    latestMinor,
    error
  })
}

async function getAndCacheLatestVersion(cached) {
  let version = cached

  if (semver.valid(version) && version !== cached) {
    // TODO set .vitaminrc
    // saveOptions({ latestVersion: version, lastChecked: Date.now() })
    return version
  }
  return cached
}
