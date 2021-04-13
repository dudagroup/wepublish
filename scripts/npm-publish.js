const fs = require('fs')
const {exec, spawn} = require('child_process')
const {resolve} = require('path')
const {readdir} = require('fs').promises

const packageFolders = [
  'packages/api-db-mongodb',
  'packages/api',
  'packages/api-media-karma',
  'packages/editor'
]
let version = ''
let originalPackageJsons = {}

main().catch(error => {
  console.error('\x1b[31m%s\x1b[0m', error.message)
})

async function main() {
  setVersion()
  await copyNpmrc()
  rewritePackageJsons()
  updateImports()
  try {
    await npmInstallAndBuild()
  } catch (error) {}
  await npmPublish()
  await cleanup()
}

function setVersion() {
  const [v] = process.argv.slice(2)
  if (!v) {
    throw new Error('Please provide a version like 2.0.0')
  }
  version = v
}

async function cleanup() {
  revertChanges()
  await rmNpmrc()
}

async function copyNpmrc() {
  return Promise.all(
    packageFolders.map(folder => {
      return execCommand(`cp .npmrc ${folder}`)
    })
  )
}

async function rmNpmrc() {
  return Promise.all(
    packageFolders.map(folder => {
      return execCommand(`rm ${folder}/.npmrc`)
    })
  )
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
    packageJson.version = version
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
}

async function npmInstallAndBuild() {
  await spawnProcess('make', ['setup-dev-environment'])
}

function revertChanges() {
  return execCommand('git reset --hard')
}

async function npmPublish() {
  for (let path of packageFolders) {
    console.log('***************************************************************************************************')
    console.log('publish', path)
    await spawnProcess(`(cd ${path}; npm publish)`)
  }
}

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, function (error, stdout, stderr) {
      if (error) {
        reject(error)
      } else {
        resolve(stdout)
      }
    })
  })
}

function spawnProcess(command, args) {
  return new Promise((resolve, reject) => {
    const pawnedProcess = spawn(command, args, {
      cwd: process.cwd(),
      stdio: 'inherit', // child process will use parent's std io's
      shell: true // useful to support double quotes in commands
    })

    pawnedProcess.on('close', code => {
      if (code !== 0) {
        reject(code)
      } else {
        resolve(code)
      }
    })
  })
}

function question(question) {
  return new Promise(function (resolve) {
    const readLine = require('readline')

    const rl = readLine.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(question, answer => {
      rl.close()
      resolve(answer)
    })
  })
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
