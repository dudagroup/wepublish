/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const {resolve} = require('path')
const {readdir} = require('fs').promises

const packageFolders = [
  'packages/api-db-mongodb',
  'packages/api',
  'packages/api-media-karma',
  'packages/editor'
]

const originalPackageJsons = {}

main().catch(error => {
  console.error('\x1b[31m%s\x1b[0m', error.message)
})

async function main() {
  rewritePackageJsons()
  updateImports()
}

function rewritePackageJsons() {
  packageFolders.forEach(folder => {
    const file = `${folder}/package.json`
    originalPackageJsons[folder] = fs.readFileSync(file, 'utf8')
    const packageJson = JSON.parse(originalPackageJsons[folder])
    packageJson.name = packageJson.name.replace('@wepublish/', '@dudagroup/')
    packageJson.repository.url = packageJson.repository.url.replace(
      'github.com/wepublish',
      'github.com/dudagroup'
    )
    packageJson.publishConfig = {
      registry: 'https://npm.pkg.github.com'
    }
    fs.writeFileSync(file, JSON.stringify(packageJson, null, 2))
  })
}

function replace(file) {
  const content = fs.readFileSync(file, 'utf8')
  if (content && content.includes('@wepublish')) {
    const r = content.replace(/@wepublish/g, '@dudagroup')
    fs.writeFileSync(file, r)
  }
}

function updateImports() {
  replace('package.json')
  handleFilesrecursive('./packages', replace)
  handleFilesrecursive('./examples', replace)
}

async function handleFilesrecursive(dir, f) {
  const dirents = await readdir(dir, {withFileTypes: true})
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      handleFilesrecursive(res, f)
    } else {
      f(res)
    }
  }
}
