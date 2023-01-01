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

async function main() {
  const bridge = await getBridge()
  const lights = await bridge.Light.all()
  console.log(lights)
}

void main()
