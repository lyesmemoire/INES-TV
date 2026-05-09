import net from 'net'

const hosts = [
  { host: 'db.mwlrfygdnrcgzlzyvmqv.supabase.co', port: 5432 },
  { host: 'db.mwlrfygdnrcgzlzyvmqv.supabase.co', port: 6543 },
  { host: 'aws-1-eu-west-3.pooler.supabase.com', port: 5432 },
  { host: 'aws-1-eu-west-3.pooler.supabase.com', port: 6543 },
  { host: 'aws-0-eu-central-1.pooler.supabase.com', port: 5432 },
  { host: 'aws-0-eu-central-1.pooler.supabase.com', port: 6543 },
]

async function check(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    const timeout = 2000
    socket.setTimeout(timeout)
    socket.on('connect', () => {
      console.log(`[SUCCESS] ${host}:${port}`)
      socket.destroy()
      resolve(true)
    })
    socket.on('timeout', () => {
      console.log(`[TIMEOUT] ${host}:${port}`)
      socket.destroy()
      resolve(false)
    })
    socket.on('error', (err) => {
      console.log(`[ERROR] ${host}:${port} - ${err.message}`)
      resolve(false)
    })
    socket.connect(port, host)
  })
}

async function main() {
  for (const h of hosts) {
    await check(h.host, h.port)
  }
}

main()
