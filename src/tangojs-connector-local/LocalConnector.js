
import * as tangojs from 'tangojs-core'
import { DeviceTreeInspector } from './DeviceTreeInspector'

/** @private */
const asRegex = (pattern) => new RegExp(pattern.replace('*', '.*'), 'g')

/**
 * In-memory connector implementation.
 */
export class LocalConnector extends tangojs.Connector {

  /**
   * @param {Object} model
   * @param {DeviceTreeInspector} treeInspector
   */
  constructor (model, inspector) {
    super()
    /** @private */
    this._model = model
    /** @private */
    this._tree = inspector || new DeviceTreeInspector(model)
  }

  /**
   * @param {string} devname
   * @return {Promise<string,Error>}
   */
  init () {
    return new Promise( (resolve, reject) => resolve(this))
  }
  

  /**
   * @param {string} devname
   * @return {Promise<string,Error>}
   */
  get_device_status (devname) {
    return this._tree.getDevice(devname)
      .then(device => device.get_status())
  }

  /**
   * @param {string} devname
   * @return {Promise<DevState,Error>}
   */
  get_device_state (devname) {
    return this._tree.getDevice(devname)
      .then(device => device.get_state())
  }

  /**
   * @param {string} devname
   * @return {Promise<DeviceInfo,Error>}
   */
  get_device_info (devname) {
    return this._tree.getDevice(devname)
      .then(device => device.get_info())
  }

  /**
   * @param {string} pattern
   * @return {Promise<string[],Error>}
   */
  get_device_list (pattern) {
    let regex = asRegex(pattern)
    return this._tree.getDeviceNameList()
      .then(list => list.filter(s => s.match(regex)))
  }

  /**
   * @param {string} pattern
   * @return {Promise<string[],Error>}
   */
  get_device_domain (pattern) {
    pattern
    throw new Error('not implemented yet')
  }

  /**
   * @param {string} pattern
   * @return {Promise<string[],Error>}
   */
  get_device_family (pattern) {
    pattern
    throw new Error('not implemented yet')
  }

  /**
   * @param {string} pattern
   * @return {Promise<string[],Error>}
   */
  get_device_member (pattern) {
    pattern
    throw new Error('not implemented yet')
  }

  /**
   * @param {string} devname
   * @param {string} pattern
   * @return {Promise<string[],Error>}
   */
  get_device_property_list (devname, pattern) {
    const regex = asRegex(pattern)
    return this._tree.getDevice(devname)
      .then(device => Object.keys(device.properties)
                        .filter(s => s.match(regex)))
  }

  /**
   * @param {string} devname
   * @param {DbDatum[]} propnames
   * @return {Promise<DbDatum[],Error>}
   */
  get_device_property (devname, propnames) {
    return Promise.all(propnames.map(p => this._tree.getProperty(devname, p)))
  }

  /**
   * @param {string} devname
   * @param {DbDatum[]} properties
   * @return {Promise<undefined,Error>}
   */
  put_device_property (devname, properties) {
    return this._tree.getDevice(devname).then(device => {
      device.properties = device.properties || {}
      properties.forEach(p => {
        device.properties[p.name] = p
      })
    })
  }

  /**
   * @param {string} devname
   * @param {string[]} propnames
   * @return {Promise<undefined,Error>}
   */
  delete_device_property (devname, propnames) {
    return this._tree.getDevice(devname).then(device => {
      propnames.forEach(p => {
        delete device.properties[p]
      })
    })
  }

  /**
   * @param {string} devname
   * @return {Promise<string[],Error>}
   */
  get_device_attribute_list (devname) {
    return this._tree.getDevice(devname)
      .then(device => Object.keys(device.attributes))
  }

  /**
   * @param {string} devname
   * @param {string[]} attnames
   * @return {Promise<AttributeInfo[],Error>}
   */
  get_device_attribute_info (devname, attnames) {
    return Promise.all(attnames.map(n => {
      return this._tree.getAttribute(devname, n)
        .then(a => a.get_info())
    }))
  }

  /**
   * @param {string} devname
   * @param {string[]} attnames
   * @return {Promise<DeviceAttribute[],Error>}
   */
  read_device_attribute (devname, attnames) {
    return Promise.all(attnames.map(attname => {
      return this._tree.getAttribute(devname, attname)
        .then(a => a.get_value())
    }))
  }

  /**
   * @param {string} devname
   * @param {DeviceAttribute[]} attrs
   * @return {Promise<undefined,Error>}
   */
  write_device_attribute (devname, attrs) {
    return Promise.all(attrs.map(({name, value}) => {
      return this._tree.getAttribute(devname, name)
        .then(attr => attr.set_value(value))
    }))
    .then(() => undefined)
  }

  /**
   * @param {string} devname
   * @param {DeviceAttribute[]} attrs
   * @return {Promise<DeviceAttribute[],Error>}
   */
  write_read_device_attribute (devname, attrs) {
    attrs
    throw new Error('not implemented yet')
  }

  /**
   * @param {string} devname
   * @param {string} cmdname
   * @param {undefined|DeviceData} argin
   * @return {Promise<DeviceData,Error>}
   */
  device_command_inout (devname, cmdname, argin) {
    return this._tree.getCommand(devname, cmdname)
      .then(cmd => cmd.inout(argin))
  }

  /**
   * @param {string} devname
   * @param {string} cmdname
   * @return {Promise<CommandInfo,Error>}
   */
  device_command_query (devname, cmdname) {
    return this._tree.getCommand(devname, cmdname)
      .then(cmd => cmd.get_info())
  }

  /**
   * @param {string} devname
   * @return {Promise<CommandInfo[],Error>}
   */
  device_command_list_query (devname) {
    return this._tree.getDevice(devname)
      .then(device => Object.keys(device.commands))
      .then(cmdnames => Promise.all(
        cmdnames.map(cmdname =>
          this._tree.getCommand(devname, cmdname)
            .then(cmd => cmd.get_info())
        )
      ))
  }
}
