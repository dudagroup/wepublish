/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const {exec, spawn} = require('child_process')

const packageFolders = [
  'packages/api-db-mongodb',
  'packages/api',
  'packages/api-media-karma',
  'packages/editor'
]
const originalPackageJsons = {}

main().catch(e => {
  process.stderr.write(e.toString())
  process.exit(1)
})

async function main() {
  const version = getVersion()
  await copyNpmrc()
  rewritePackageJsons(version)
  await npmInstallAndBuild()
  await npmPublish()
  await cleanup()
}

function getVersion() {
  const [v] = process.argv.slice(2)
  if (!v) {
    throw new Error('Please provide a version like 1.0.0')
  }
  return v
}

async function cleanup() {
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

function rewritePackageJsons(version) {
  packageFolders.forEach(folder => {
    const file = `${folder}/package.json`
    originalPackageJsons[folder] = fs.readFileSync(file, 'utf8')
    const packageJson = JSON.parse(originalPackageJsons[folder])
    packageJson.publishConfig = {
      registry: 'https://npm.pkg.github.com'
    }
    packageJson.version = version
    fs.writeFileSync(file, JSON.stringify(packageJson, null, 2))
  })
}

async function npmInstallAndBuild() {
  await spawnProcess('yarn install --frozen-lockfile')
  await spawnProcess('yarn build')
}

async function npmPublish() {
  for (const path of packageFolders) {
    console.log(
      '***************************************************************************************************'
    )
    console.log('publish', path)
    await spawnProcess(`(cd ${path}; npm publish)`)
  }
}

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, function (error, stdout, stderr) {
      if (error) {
        reject(stderr)
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
