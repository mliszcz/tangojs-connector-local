import chai from 'chai'
import { DeviceTreeInspector } from '../../../src/tangojs-connector-local/DeviceTreeInspector'

chai.should()

/**
 * @test {DeviceTreeInspector}
 */
describe('DeviceTreeInspector', () => {

  let inspector
  let model

  beforeEach(() => {
    model = {}
    inspector = new DeviceTreeInspector(model)

    updateModel({
      dom1: {
        fam11: {
          mem111: null,
          mem112: null
        },
        fam12: {
          mem121: null
        }
      },
      dom2: {
        fam21: {
          mem211: null
        }
      }
    })

  })

  let updateModel = (newModel) => {
    Object.assign(model, newModel)
  }

  describe('getDeviceNameList', () => {
    it('Should list of all device names', () => {
      inspector.getDeviceNameList().should.have.members([
        'dom1/fam11/mem111',
        'dom1/fam11/mem112',
        'dom1/fam12/mem121',
        'dom2/fam21/mem211'
      ])
    })
  })
})
