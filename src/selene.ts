import semver from 'semver'
import { getOctokit } from '@actions/github'

interface GitHubAsset {
  name: string
  browser_download_url: string
}

interface GitHubRelease {
  tag_name: string
  assets: GitHubAsset[]
}

/**
 * Get the latest selene release
 *
 * @param releases - The selene releases
 * @returns The latest selene release or null
 */
async function getLatestRelease(
  releases: GitHubRelease[]
): Promise<string | null> {
  return semver.clean(releases[0].tag_name)
}

/**
 * Get all selene releases
 *
 * @param token - The github secret token
 * @returns The selene releases
 */
async function getReleases(token: string): Promise<GitHubRelease[]> {
  const octokit = getOctokit(token)
  const { data: releases } = await octokit.repos.listReleases({
    owner: 'Kampfkarren',
    repo: 'selene'
  })

  // Sort releases
  releases.sort((a, b) => semver.rcompare(a.tag_name, b.tag_name))
  return releases
}

/**
 * Get the provided selene release
 *
 * @param version - The release version
 * @param releases - The selene releases
 * @returns The selene release or undefined
 */
async function getRelease(
  version: string,
  releases: GitHubRelease[]
): Promise<GitHubRelease | undefined> {
  return releases.find(release => semver.satisfies(release.tag_name, version))
}

type Matcher = (name: string) => boolean

/**
 * Get the correct asset for the current platform (OS)
 *
 * @param asset - The release asset
 * @returns The asset for the current platform
 */
const getPlatformRelease: () => Matcher = () => {
  switch (process.platform) {
    case 'linux':
      return name => name.includes('linux')
    case 'darwin':
      return name => name.includes('macos')
    case 'win32':
      return name => name.includes('windows')
    default:
      throw new Error('Current platform not supported')
  }
}

/**
 * Get the provided asset from release
 *
 * @param release - The release where lies the asset
 * @returns The release asset or undefined
 */
async function getAsset(
  release: GitHubRelease
): Promise<GitHubAsset | undefined> {
  const platformRelease = getPlatformRelease()
  return release.assets.find(asset => platformRelease(asset.name))
}

export default {
  getRelease,
  getReleases,
  getLatestRelease,
  getAsset
}
