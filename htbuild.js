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

  const settings = {}
  while (args.length > 0) {
    const opt = args.shift()
    switch (opt) {
    case '-f':
      settings.force = true
      break
    case '-n':
      settings.name = args.shift()
      break
    }
  }
  if (stdout.trim() !== '' && !settings.force) {
    console.error('Changes not committed, abort (use -f to force update metadata.json)')
    process.exit(1)
  }
  console.log(settings)
  const meta = await genMeta(settings.name)
  console.log(meta)
}

async function genMeta (name) {
  let output
  try {
    const data = await readFile(name)
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

  const data = JSON.stringify(output, null, 2)
  await writeFile(name, data)

  return data
}

function buildId () {
  const start = Date.parse('2018-06-13T00:00:00+08:00')
  const now = Date.now()
  const diff = Math.floor((now - start) / (60 * 1000))
  const min = diff % (60 * 24)
  const day = Math.floor(diff / (60 * 24))
  return `${day}.${min}`
}
