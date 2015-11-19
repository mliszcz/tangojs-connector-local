import chai from 'chai'
import sinon from 'sinon'
import chaiAsPromised from 'chai-as-promised'
import sinonChai from 'sinon-chai'
import { LocalConnector } from '../../../src/tangojs-connector-local'

chai.use(chaiAsPromised)
chai.use(sinonChai)
chai.should()

/**
 * @test {LocalConnector}
 */
describe('LocalConnector', () => {

  let connector
  let inspector
  let model

  beforeEach(() => {
    model = {}
    inspector = {}
    connector = new LocalConnector(model, inspector)
  })

  describe('get_device_status', () => {

    it('Should return device status', () => {

      const devname = 'my/dev/1'
      const status = 'STATUS'

      let device = {
        get_status: sinon.stub().returns(status)
      }

      inspector.getDevice = sinon.stub()
        .withArgs(devname)
        .returns(Promise.resolve(device))

      return connector.get_device_status(devname)
        .should.eventually.be.equal(status)
    })
  })
})
