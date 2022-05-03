import { writeFile, readFile } from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'
const execP = promisify(exec)
const args = process.argv.slice(2)
main()

async function main () {
  const { stdout, stderr } = await execP('git status --porcelain')

  if (stderr) {
    console.log(stderr)
  }

  if (args[0] !== '--force' && args[0] !== '-f') {
    if (stdout.trim() !== '') {
      console.error('Changes not committed, abort (use --force or -f to force update metadata.json)')
      process.exit(1)
    }
  }

  const meta = await genMeta()
  const data = JSON.stringify(meta, null, 2)
  await writeFile('./metadata.json', data)
  console.log(meta)
}

async function genMeta () {
  let output
  try {
    const data = await readFile('./metadata.json')
    output = JSON.parse(data)
  } catch (err) {
    output = { docker_build: buildId(), build: 0 }
  }
  // const output = { docker_build: buildId() }
  output.docker_build = buildId()
  output.build = output.build + 1

  const { stdout: hash } = await execP('git rev-parse --short=10 HEAD')
  output.hash = hash.trim()

  const { stdout: branch } = await execP('git branch --show-current')
  output.branch = branch.trim()
  return output
}

function buildId () {
  const start = Date.parse('2018-06-13T00:00:00+08:00')
  const now = Date.now()
  const diff = Math.floor((now - start) / (60 * 1000))
  const min = diff % (60 * 24)
  const day = Math.floor(diff / (60 * 24))
  return `${day}.${min}`
}
