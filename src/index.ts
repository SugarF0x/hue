import { Bridge, Hue } from 'hue'
import dotenv from 'dotenv'

dotenv.config()
const { HUE_BRIDGE, HUE_USER } = process.env

async function getBridge(): Promise<Bridge> {
  const hue = new Hue(HUE_BRIDGE, HUE_USER)

  return new Promise(resolve => {
    hue.on('ready', resolve)
  })
}

async function delay(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  const bridge = await getBridge()
  const groups = await bridge.Group.all()
  const livingRoomLightIds = groups.find(group => group.name.toLowerCase().includes('living'))?.lights ?? []
  const allLights = await bridge.Light.all()
  const lights = allLights.filter(light => livingRoomLightIds.includes(light.id))

  console.log(lights)

  for (const light of lights) {
    await light.on()
    await delay(500)
  }

  for (const light of lights) {
    await light.off()
    await delay(500)
  }
}

void main()
