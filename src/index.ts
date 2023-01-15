import { discovery, api as rawApi, model } from 'node-hue-api'
import dotenv from 'dotenv'
import * as child_process from "child_process"
import * as fs from "fs"
dotenv.config()

const { HUE_BRIDGE, HUE_USER } = process.env

function getIpCache() {
  if (!fs.existsSync('.env.ip')) return null
  dotenv.config({ path: '.env.ip' })
}

function cacheIp(ip: string) {
  fs.writeFileSync('.env.ip', `HUE_IP=${ip}`)
}

async function fetchNewIP() {
  const results = await discovery.mdnsSearch(500)
  const ip = results.find(bridge => bridge.model.serial === HUE_BRIDGE).ipaddress ?? null

  if (!ip) process.exit(1)
  child_process.exec(`export HUE_IP=${ip}`)
  cacheIp(ip)

  return ip
}

async function getApi() {
  getIpCache()

  let ip = process.env.HUE_IP
  console.log({ ip })

  try {
    return await rawApi.createLocal(ip).connect(HUE_USER)
  } catch {
    return await rawApi.createLocal(await fetchNewIP()).connect(HUE_USER)
  }
}

async function delay(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  const api = await getApi()

  const livingRoom = (await api.groups.getGroupByName('Living room'))[0]
  if (!livingRoom) process.exit(1)
  if (!(livingRoom instanceof model.Room)) process.exit(1)

  const state = new model.LightState().off()

  for (const id of livingRoom.lights) {
    await api.lights.setLightState(id, state)
    await delay(500)
  }
}

void main()
