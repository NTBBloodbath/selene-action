import * as core from '@actions/core'
import { exec } from '@actions/exec'
import * as tc from '@actions/tool-cache'
import * as semver from 'semver'
import selene from './selene'

async function run(): Promise<void> {
  try {
    // Get required information from CI file
    const token = core.getInput('token')
    const args = core.getInput('args')
    let version = semver.clean(core.getInput('version'))

    let releases

    // If no specific version was passed then download the latest selene release
    if (!version || version === '') {
      core.debug(
        'No version provided or invalid version provided. Falling back to latest release ...'
      )

      releases = await selene.getReleases(token)
      const latestRelease = await selene.getLatestRelease(releases)
      if (!latestRelease) {
        throw new Error(
          'Could not find latest release version. Please specify an explicit version'
        )
      }

      version = latestRelease
    }

    // Check if we already have selene installed
    core.debug('Looking for cached version of selene ...')
    const seleneDir = tc.find('selene', version)
    if (seleneDir) {
      core.debug(`Found cached version of selene at ${seleneDir}`)
      core.addPath(seleneDir)
    } else {
      core.debug('No cached version found, downloading selene ...')
      // If a specific version was passed then download it
      if (!releases) {
        releases = await selene.getReleases(token)
      }

      // Get latest release
      core.debug('Retrieving selene release ...')
      const release = await selene.getRelease(version, releases)
      if (!release) {
        throw new Error(`Could not find release for version ${version}`)
      }

      // Get release asset for current OS, e.g. selene-version-linux.zip
      core.debug(`Chose release ${release.tag_name}`)
      const asset = await selene.getAsset(release)
      if (!asset) {
        throw new Error(
          `Could not find asset for ${release.tag_name} on platform ${process.platform}`
        )
      }
      core.debug(`Downloading asset ${asset.browser_download_url}`)

      // Download and extract release asset
      const downloadedPath = await tc.downloadTool(asset.browser_download_url)
      const extractedPath = await tc.extractZip(downloadedPath)
      // Add extracted asset to cache
      await tc.cacheDir(extractedPath, 'selene', version)
      core.addPath(extractedPath)

      // Set executable permissions on Unix systems
      if (process.platform === 'linux' || process.platform === 'darwin') {
        await exec(`chmod +x ${extractedPath}/selene`)
      }
    }

    // Run selene
    core.debug(`Running selene with arguments: ${args}`)
    await exec(`selene ${args}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
