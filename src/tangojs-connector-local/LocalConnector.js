
import * as tangojs from 'tangojs-core'

import { DeviceTreeInspector } from './DeviceTreeInspector'

/** @private */
let asRegex = (pattern) => new RegExp(pattern.replace('*', '.*'), 'g')

/** @private */
let extractPropnames = (propnames) => {
  return (Array.isArray(propnames) ? propnames : [propnames])
    .map(p => (p instanceof tangojs.core.api.DbDatum) ? p.name
            : (typeof p === 'string' || p instanceof String) ? p
            : '')
    .filter(p => p !== '')
}

/** @private */
let wrapAsPromisedArray = (x) => Promise.resolve(Array.isArray(x) ? x : [x])

/**
 * In-memory connector implementation.
 */
export class LocalConnector extends tangojs.core.Connector {

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
    let props = extractPropnames(propnames)
      .map(p => this._tree.getProperty(devname, p))
    return Array.isArray(propnames) ? Promise.all(props) : props[0]
  }

  /**
   * @return {Promise<undefined>}
   * @param {string} devname
   * @param {DbDatum[]} properties
   */
  put_device_property(devname, prop) {
    return this._tree.getDevice(devname).then(device => {
      device.properties = device.properties || {}
      device.properties[prop.name] = prop
    })
  }

  /**
   * @return {Promise<undefined>}
   * @param {string} devname
   * @param {string|string[]|DbDatum[]} propnames property names
   */
  delete_device_property(devname, propnames) {
    return this._tree.getDevice(devname).then(device => {
      extractPropnames(propnames).forEach(p => {
        delete device.properties[p]
      })
    })
  }

  /**
   * @return {Promise<string[]>}
   * @param {string} devname
   */
  get_device_attribute_list(devname) {
    return this._tree.getDevice(devname)
      .then(device => Object.keys(device.attributes))
  }

  /**
   * @return {Promise<AttributeInfo>|Promise<AttributeInfo[]>}
   * @param {string} devname
   * @param {undefined|string|string[]} attnames
   */
  get_device_attribute_info(devname, attnames) {
    let names = attnames ? wrapAsPromisedArray(attnames)
      : this.get_device_attribute_list(devname)
    return names.then(names => {
      return Promise.all(names.map(n => {
        return this._tree.getAttribute(devname, n)
          .then(a => a.get_info())
      }))
    })
    .then(infos => {
      return attnames ? Array.isArray(attnames) ? infos : infos[0]
        : infos
    })
  }

  /**
   * @return {Promise<DeviceAttribute>|Promise<DeviceAttribute[]>}
   * @param {string} devname
   * @param {string|string[]} attname
   */
  read_device_attribute(devname, attnames) {
    return wrapAsPromisedArray(attnames).then(attnames => {
      return Promise.all(attnames.map(attname => {
        return this._tree.getAttribute(devname, attname)
          .then(a => a.get_value())
      }))
    })
    .then(attrs => Array.isArray(attnames) ? attrs : attrs[0] )
  }

  /**
  * @return {Promise<undefined>}
   * @param {string} devname
   * @param {DeviceAttribute|DeviceAttribute[]} attrs
   */
  write_device_attribute(devname, attrs) {
    return wrapAsPromisedArray(attrs)
      .then(attrs => attrs.map(a => [a.name, a.value]))
      .then(nvList => Promise.all(nvList.map(([name, value]) =>
        this._tree.getAttribute(devname, name)
          .then(attr => attr.set_value(value))
      )))
  }

  /**
   * @return {Promise<DeviceAttribute>|Promise<DeviceAttribute[]>}
   * @param {string} devname
   * @param {DeviceAttribute|DeviceAttribute[]} attrs
   */
  write_read_device_attribute(devname, attrs) {
    attrs
    throw new Error('not implemented yet')
  }

  /**
   * @return {Promise<DeviceData>}
   * @param {string} devname
   * @param {string} cmdname
   * @param {undefined|DeviceData} argin
   */
  device_command_inout(devname, cmdname, argin) {
    return this._tree.getCommand(devname, cmdname)
      .then(cmd => cmd.inout(argin))
  }

  /**
   * @return {Promise<CommandInfo>}
   * @param {string} devname
   * @param {string} cmdname
   */
  device_command_query(devname, cmdname) {
    return this._tree.getCommand(devname, cmdname)
      .then(cmd => cmd.get_info())
  }

  /**
   * @return {Promise<CommandInfo[]>}
   * @param {string} devname
   */
  device_command_list_query(devname) {
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
