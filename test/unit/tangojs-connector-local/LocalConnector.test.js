import chai from 'chai'
import sinon from 'sinon'
import chaiAsPromised from 'chai-as-promised'
import sinonChai from 'sinon-chai'
import { LocalConnector } from '../../../src/tangojs-connector-local'
import * as tangojs from 'tangojs-core'

chai.use(chaiAsPromised)
chai.use(sinonChai)
chai.should()

/**
 * @test {LocalConnector}
 */
describe('LocalConnector', () => {

  const devname = 'my/dev/1'

  let connector
  let inspector
  let model

  beforeEach(() => {
    model = {}
    inspector = {}
    connector = new LocalConnector(model, inspector)
  })

  let registerDevice = (devname, device) => {
    inspector.getDevice = sinon.stub()
      .withArgs(devname)
      .returns(Promise.resolve(device))
  }

  describe('get_device_status', () => {
    it('Should return device status', () => {

      const status = 'STATUS'

      registerDevice(devname, {
        get_status: sinon.stub().returns(status)
      })

      return connector.get_device_status(devname)
        .should.eventually.be.equal(status)
    })
  })

  describe('get_device_state', () => {
    it('Should return device state', () => {

      const state = tangojs.tango.DevState.INIT

      registerDevice(devname, {
        get_state: sinon.stub().returns(state)
      })

      return connector.get_device_state(devname)
        .should.eventually.be.equal(state)
    })
  })

  describe('get_device_info', () => {
    it('Should return device state', () => {

      const info = new tangojs.api.DeviceInfo({
        name: devname,
        ior: '12345'
      })

      registerDevice(devname, {
        get_info: sinon.stub().returns(info)
      })

      return connector.get_device_info(devname)
        .should.eventually.be.equal(info)
    })
  })

  describe('get_device_list', () => {

    let names = ['my/dev/1', 'my/dev/2', 'my/foo/1', 'foo/baz/bar']

    beforeEach(() => {
      inspector.getDeviceNameList = sinon.stub()
        .returns(Promise.resolve(names))
    })

    it('Should return all devices for "*"', () => {
      return connector.get_device_list('*')
        .should.eventually.have.members(names)
    })

    it('Should return filtered devices', () => {
      return Promise.all([
        connector.get_device_list('my/*/1')
          .should.eventually.have.members(['my/dev/1', 'my/foo/1']),
        connector.get_device_list('*foo*')
          .should.eventually.have.members(['my/foo/1', 'foo/baz/bar'])
      ])
    })
  })

  xdescribe('get_device_domain', () => {
    it('Should return domains', () => { })
  })

  xdescribe('get_device_family', () => {
    it('Should return families', () => { })
  })

  xdescribe('get_device_member', () => {
    it('Should return members', () => { })
  })

  describe('get_device_property_list', () => {
    it('Should return device properties', () => {

      registerDevice(devname, {
        properties: { prop1: null, prop2: null }
      })

      return connector.get_device_property_list(devname, '*')
        .should.eventually.have.members(['prop1', 'prop2'])
    })
  })

  describe('get_device_property', () => {

    let prop1 = new tangojs.api.DbDatum('prop1', 10)
    let prop2 = new tangojs.api.DbDatum('prop2', {})

    beforeEach(() => {
      inspector.getProperty = sinon.stub()
      inspector.getProperty.withArgs(devname, 'prop1')
        .returns(Promise.resolve(prop1))
      inspector.getProperty.withArgs(devname, 'prop2')
        .returns(Promise.resolve(prop2))
    })

    it('Should return device property for string name', () => {
      return connector.get_device_property(devname, 'prop1')
        .should.eventually.be.equal(prop1)
    })

    it('Should return device property for string[] names', () => {
      return connector.get_device_property(devname, ['prop1', 'prop2'])
        .should.eventually.have.members([prop1, prop2])
    })

    it('Should return device property for DbDatum[] names', () => {
      return connector.get_device_property(devname, [prop1, prop2])
        .should.eventually.have.members([prop1, prop2])
    })
  })

  describe('put_device_property', () => {
    it('Should create / update device property', () => {

      let prop3 = new tangojs.api.DbDatum('prop3', 0)
      let properties = { }

      registerDevice(devname, { properties })

      return connector.put_device_property(devname, prop3).then(() =>
        properties.should.have.property('prop3', prop3)
      )
    })

  })

  describe('delete_device_property', () => {
    it('Should delete device property', () => {

      let properties = {
        prop3: new tangojs.api.DbDatum('prop3', 0)
      }

      registerDevice(devname, { properties })
      connector.delete_device_property(devname, 'prop3')

      return connector.delete_device_property(devname, 'prop3').then(() =>
        properties.should.not.have.property('prop3')
      )
    })
  })

  describe('get_device_attribute_list', () => {
    it('Should return list of attribute names', () => {

      registerDevice(devname, {
        attributes: { attr1: null, attr2: null }
      })

      return connector.get_device_attribute_list(devname)
        .should.eventually.have.members(['attr1', 'attr2'])
    })
  })

  describe('get_device_attribute_info', () => {

    let info1 = new tangojs.api.AttributeInfo({})
    let info2 = new tangojs.api.AttributeInfo({})
    let info3 = new tangojs.api.AttributeInfo({})

    beforeEach(() => {

      registerDevice(devname, {
        attributes: { attr1: null, attr2: null, attr3: null }
      })

      inspector.getAttribute = sinon.stub()

      let attrinfos = { attr1: info1, attr2: info2, attr3: info3 }

      Object.keys(attrinfos).forEach(attrname => {
        inspector.getAttribute.withArgs(devname, attrname)
          .returns(Promise.resolve({
            get_info: sinon.stub().returns(attrinfos[attrname])
          }))
      })
    })

    it('Should return attribute info for string name', () => {
      return connector.get_device_attribute_info(devname, 'attr2')
        .should.eventually.be.equal(info2)
    })

    it('Should return attributes info for string[] name', () => {
      return connector.get_device_attribute_info(devname, ['attr1', 'attr3'])
        .should.eventually.have.members([info1, info3])
    })

    it('Should return all attributes info when no name is provided', () => {
      return connector.get_device_attribute_info(devname)
        .should.eventually.have.members([info1, info2, info3])
    })
  })

  describe('read_device_attribute', () => {

    let devAttr1 = new tangojs.api.DeviceAttribute({})
    let devAttr2 = new tangojs.api.DeviceAttribute({})

    beforeEach(() => {

      let attrs = { attr1: devAttr1, attr2: devAttr2 }

      inspector.getAttribute = sinon.stub()

      Object.keys(attrs).forEach(attrname => {
        inspector.getAttribute.withArgs(devname, attrname)
          .returns(Promise.resolve({
            get_value: sinon.stub().returns(attrs[attrname])
          }))
      })
    })

    it('Should return read result for single attribute', () => {
      return connector.read_device_attribute(devname, 'attr2')
        .should.eventually.be.equal(devAttr2)
    })

    it('Should return read results for multiple attributes', () => {
      return connector.read_device_attribute(devname, ['attr1', 'attr2'])
        .should.eventually.have.members([devAttr1, devAttr2])
    })
  })

  describe('write_device_attribute', () => {

    let attrs = {
      attr1: {
        value: new tangojs.api.DeviceAttribute({name: 'attr1', value: 10}),
        spy: null
      },
      attr2: {
        value: new tangojs.api.DeviceAttribute({name: 'attr2', value: 11}),
        spy: null
      }
    }

    beforeEach(() => {

      inspector.getAttribute = sinon.stub()

      Object.keys(attrs).forEach(attrname => {
        attrs[attrname].spy = sinon.spy()
        inspector.getAttribute.withArgs(devname, attrname)
          .returns(Promise.resolve({
            set_value: attrs[attrname].spy
          }))
      })
    })

    xit('Should write value for single attribute', () => {
      // the spy is not notified, probably due to asynchronous call
      let val = attrs.attr1.value
      attrs.attr1.spy.should.have.been.calledOnce.with(val)
      return connector.write_device_attribute(devname, val)
    })

    xit('Should write value for multiple attributes', () => {
      let val1 = attrs.attr1.value
      let val2 = attrs.attr2.value
      attrs.attr1.spy.should.have.been.calledOnce.with(val1)
      attrs.attr1.spy.should.have.been.calledOnce.with(val2)
      return connector.write_device_attribute(devname, [val1, val2])
    })
  })

  xdescribe('write_read_device_attribute', () => {

    it('Should write and read single attribute', () => {
      return connector.write_read_device_attribute(devname, {})
        .should.eventually.be.equal()
    })

    it('Should write and read multiple attributes', () => {
      return connector.write_read_device_attribute(devname, {})
        .should.eventually.be.equal()
    })
  })

  describe('device_command_inout', () => {

    it('Should invoke command with arguments', () => {

      let arg1 = new tangojs.api.DeviceData(10)
      let out1 = new tangojs.api.DeviceData(20)

      inspector.getCommand = sinon.stub().withArgs(devname, 'cmd1')
        .returns(Promise.resolve({
          inout: sinon.stub().withArgs(arg1).returns(out1)
        }))

      return connector.device_command_inout(devname, 'cmd1', arg1)
        .should.eventually.be.equal(out1)
    })

    it('Should invoke 0-arity command', () => {

      let out1 = new tangojs.api.DeviceData(20)

      inspector.getCommand = sinon.stub().withArgs(devname, 'cmd1')
        .returns(Promise.resolve({
          inout: sinon.stub().withArgs().returns(out1)
        }))

      return connector.device_command_inout(devname, 'cmd1')
        .should.eventually.be.equal(out1)
    })
  })

  describe('device_command_query', () => {
    it('Should return command info', () => {

      let info = new tangojs.api.CommandInfo({})

      inspector.getCommand = sinon.stub().withArgs(devname, 'cmd1')
        .returns(Promise.resolve({
          get_info: sinon.stub().withArgs().returns(info)
        }))

      return connector.device_command_query(devname, '')
        .should.eventually.be.equal(info)
    })
  })

  describe('device_command_list_query', () => {

    let info1 = new tangojs.api.CommandInfo({})
    let info2 = new tangojs.api.CommandInfo({})

    beforeEach(() => {

      inspector.getDevice = sinon.stub().withArgs(devname)
        .returns(Promise.resolve({
          commands: { cmd1: null, cmd2: null }
        }))

      inspector.getCommand = sinon.stub()

      inspector.getCommand.withArgs(devname, 'cmd1')
        .returns(Promise.resolve({
          get_info: sinon.stub().withArgs().returns(info1)
        }))

      inspector.getCommand.withArgs(devname, 'cmd2')
        .returns(Promise.resolve({
          get_info: sinon.stub().withArgs().returns(info2)
        }))
    })

    it('Should return info for all commands', () => {
      return connector.device_command_list_query(devname)
        .should.eventually.have.members([info1, info2])
    })
  })
})
