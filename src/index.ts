import { discovery, api as rawApi, model } from 'node-hue-api'
import dotenv from 'dotenv'
dotenv.config()

const { HUE_BRIDGE, HUE_USER } = process.env

async function getApi() {
  const results = await discovery.mdnsSearch(500)
  const ip = results.find(bridge => bridge.model.serial === HUE_BRIDGE).ipaddress ?? null
  if (!ip) process.exit(1)

  return await rawApi.createLocal(ip).connect(HUE_USER)
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
    await delay(250)
  }
}

void main()
