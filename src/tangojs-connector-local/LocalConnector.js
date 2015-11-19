
import * as tangojs from 'tangojs'

import { DeviceTreeInspector } from './DeviceTreeInspector'

/** @private */
let asRegex = pattern => `/${pattern.replace('*', '.*')}/g`

/**
 * In-memory connector implementation.
 */
export class LocalConnector extends tangojs.Connector {

  /**
   * @param {Object} model
   * @param {DeviceTreeInspector} treeInspector
   */
  constructor(model, inspector) {
    super()
    /** @private */
    this._model = model
    /** @private */
    this._tree = inspector || new DeviceTreeInspector(model)
  }

  /**
   * @return {Promise<string>}
   * @param {string} devname
   */
  get_device_status(devname) {
    return this._tree.getDevice(devname)
      .then(device => device.get_status())
  }

  /**
   * @return {Promise<DevState>}
   * @param {string} devname
   */
  get_device_state(devname) {
    return this._tree.getDevice(devname)
      .then(device => device.get_state())
  }

  /**
   * @return {Promise<DeviceInfo>}
   * @param {string} devname
   */
  get_device_info(devname) {
    return this._tree.getDevice(devname)
      .then(device => device.get_info())
  }

  /**
   * @return {Promise<string[]>}
   * @param {string} pattern
   */
  get_device_list(pattern) {
    let regex = asRegex(pattern)
    return this._tree.getDeviceNameList()
      .then(list => list.filter(s => s.match(regex)))
  }

  /**
   * @return {Promise<string[]>}
   * @param {string} pattern
   */
  get_device_domain(pattern) {
    throw new Error(pattern)
  }

  /**
   * @return {Promise<string[]>}
   * @param {string} pattern
   */
  get_device_family(pattern) {
    throw new Error(pattern)
  }

  /**
   * @return {Promise<string[]>}
   * @param {string} pattern
   */
  get_device_member(pattern) {
    throw new Error(pattern)
  }

  /**
   * @return {Promise<string[]>}
   * @param {string} devname
   * @param {string} pattern
   */
  get_device_property_list(devname, pattern) {
    let regex = asRegex(pattern)
    return this._tree.getDevice(devname)
      .then(device => Object.keys(device.properties)
                        .filter(s => s.match(regex)))
  }

  /**
   * @return {Promise<DbDatum>|Promise<DbDatum[]>}
   * @param {string} devname
   * @param {string|string[]|DbDatum[]} propnames
   */
  get_device_property(devname, propnames) {
    let props = (Array.isArray(propnames) ? propnames : [propnames])
      .map(p => (p instanceof tangojs.struct.DbDatum) ? p.value
              : (typeof p === 'string' || p instanceof String) ? p
              : '')
      .map(p => this._tree.getProperty(devname, p))
    return Promise.all(props).then( props => props.map(p => p.get()) )
  }

  /**
   * @param {string} devname
   * @param {DbDatum[]} properties
   */
  put_device_property(devname, properties) { }

  /**
   * @param {string} devname
   * @param {string|string[]|DbDatum[]} propnames property names
   */
  delete_device_property(devname, propnames) { }

  /**
   * @return {Promise<string[]>}
   * @param {string} devname
   */
  get_device_attribute_list(devname) { }

  /**
   * @return {Promise<AttributeInfo>|Promise<AttributeInfo[]>}
   * @param {string} devname
   * @param {undefined|string|string[]} attnames
   */
  get_device_attribute_info(devname, attnames) { }

  /**
   * @return {Promise<DeviceAttribute>|Promise<DeviceAttribute[]>}
   * @param {string} devname
   * @param {string|string[]} attname
   */
  read_device_attribute(devname, attname) { }

  /**
   * @param {string} devname
   * @param {DeviceAttribute|DeviceAttribute[]} attrs
   */
  write_device_attribute(devname, attrs) { }

  /**
   * Write and then read the attribute values, for the specified device.
   * @return {Promise<DeviceAttribute>|Promise<DeviceAttribute[]>}
   * @param {string} devname
   * @param {DeviceAttribute|DeviceAttribute[]} attrs
   */
  write_read_device_attribute(devname, attrs) { }

  /**
   * @return {Promise<DeviceData>}
   * @param {string} devname
   * @param {string} cmdname
   * @param {undefined|DeviceData} argin
   */
  device_command_inout(devname, cmdname, argin) { }

  /**
   * @return {Promise<CommandInfo>}
   * @param {string} devname
   * @param {string} cmdname
   */
  device_command_query(devname, cmdname) { }
}
