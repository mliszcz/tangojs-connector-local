
/** @private */
function reject (message) {
  return Promise.reject(new Error(message))
}

/** @private */
const slash = new RegExp('/', 'g')

/** @private */
function flatten (object, depth, separator) {
  return (depth === 1) ? object
    : Object.keys(object).reduce((flattened, key1) => {
      let value = object[key1]
      let merged
      if (typeof value !== 'object' || value === null) {
        merged = {}
        merged[key1] = value
      } else {
        let child = flatten(object[key1], depth-1, separator)
        merged = Object.keys(child).reduce((acc, key2) => {
          acc[`${key1}${separator}${key2}`] = child[key2]
          return acc
        }, {})
      }
      return Object.assign(flattened, merged)
    }, {})
}

export class DeviceTreeInspector {

  /**
   * @param {Object} model
   */
  constructor (model) {
    /** @private */
    this._model = model
  }

  /**
   * @param {string} devname
   * @return {Promise<Object>}
   */
  getDevice (devname) {
    try {
      let [domain, family, member] = devname.split('/')
      return Promise.resolve(this._model[domain][family][member])
    } catch (error) {
      return reject(`Invalid device name: '${name}'`)
    }
  }

  /**
   * @param {string} devname
   * @param {string} attname
   * @return {Promise<Object>}
   */
  getAttribute (devname, attname) {
    return this.getDevice(devname).then(device =>
      device.attributes && device.attributes[attname]
        ? device.attributes[attname]
        : reject(`Attribute not found: '${devname}/${attname}'`)
    )
  }

  /**
   * @param {string} devname
   * @param {string} cmdname
   * @return {Promise<Object>}
   */
  getCommand (devname, cmdname) {
    return this.getDevice(devname).then(device =>
      device.commands && device.commands[cmdname]
        ? device.commands[cmdname]
        : reject(`Command not found: '${devname}/${cmdname}'`)
    )
  }

  /**
   * @param {string} devname
   * @param {string} propname
   * @return {Promise<Object>}
   */
  getProperty (devname, propname) {
    return this.getDevice(devname).then(device =>
      device.properties && device.properties[propname]
        ? device.properties[propname]
        : reject(`Property not found: '${devname}/${propname}'`)
    )
  }

  /**
   * @return {Promise<string[]>}
   */
  getDeviceNameList () {
    const list = Object.keys(flatten(this._model, 3, '/'))
      .filter(key => (key.match(slash) || []).length === 2)
    return Promise.resolve(list)
  }
}
