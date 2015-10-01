
// FIXME '* as' should not be there
// https://github.com/babel/babel/issues/95

import * as tangojs from 'tangojs'

/** @private */
function now() {
  return (new Date()).getTime()
}

/** @private */
function reject(message) {
  return Promise.reject(new Error(message))
}

/**
 * In-memory connector implementation.
 */
export class LocalConnector extends tangojs.Connector {

  /**
   * @param {Object} data model
   */
  constructor(model) {
    super()
    /** @private */
    this._model = model
  }

  /** @private */
  _devicePromise(name) {
    try {
      let [domain, family, member] = name.split('/')
      return Promise.resolve(this._model[domain][family][member])
    } catch (error) {
      return reject(`Invalid device name: '${name}'`)
    }
  }

  /** @private */
  _attributePromise(deviceName, attributeName) {
    return this._devicePromise(deviceName).then(device =>
      device.attributes && device.attributes[attributeName]
        ? device.attributes[attributeName]
        : reject(`Attribute not found: '${deviceName}/${attributeName}'`)
    )
  }

  /** @private */
  _commandPromise(deviceName, commandName) {
    return this._devicePromise(deviceName).then(device =>
      device.commands && device.commands[commandName]
        ? device.commands[commandName]
        : reject(`Command not found: '${deviceName}/${commandName}'`)
    )
  }

  // --- tangojs.Connector implementation starts here ---

  dbReadDomains() {
    return this._model
      ? Promise.resolve(Object.keys(this._model))
      : Promise.reject(new Error('Invalid model'))
  }

  dbReadFamilies(domain) {
    return this._model && this._model[domain]
      ? Promise.resolve(Object.keys(this._model[domain]))
      : Promise.reject(new Error(`Invalid domain: '${domain}'`))
  }

  dbReadMembers(domain, family) {
    return this._model && this._model[domain] && this._model[domain][family]
      ? Promise.resolve(Object.keys(this._model[domain][family]))
      : Promise.reject(
          new Error(`Invalid domain: '${domain}' or family: '${family}'`))
  }

  readDeviceStatus(deviceName) {
    return this._devicePromise(deviceName).then(device => {
      let [state, status] = device.status()
      return new tangojs.DeviceStatusResponse(now(), state, status)
    })
  }

  readDeviceInfo(deviceName) {
    return this._devicePromise(deviceName).then(device =>
      new tangojs.DeviceInfo(device.info())
    )
  }

  readAttributesList(deviceName) {
    return this._devicePromise(deviceName).then(device =>
      Object.keys(device.attributes)
    )
  }

  readAttributeValue(deviceName, attributeName) {
    return this._attributePromise(deviceName, attributeName).then(attribute =>
      new tangojs.AttributeReadResponse(now(), attribute.read(),
        tangojs.AttributeQuality.ATTR_VALID)
    )
  }

  writeAttributeValuesBulk(deviceName, nameValuePairs, sync = false,
    reset = false) {

    // attribute objects paired with values to write
    let attributeValuePairsPromises = nameValuePairs.map(([name, value]) =>
      this._attributePromise(deviceName, name).then(attr => [attr, value])
    )

    let quality = tangojs.AttributeQuality.ATTR_VALID

    // write values and read stored results (if required)
    let writeAttributeValuePairs = attributeValuePairs => attributeValuePairs
      .map(([attr, value]) => [attr, attr.write(value)])
      .map(([attr]) => sync
        ? new tangojs.AttributeReadResponse(now(), attr.read(), quality)
        : undefined
      )

    let changedNames = nameValuePairs.map(([n]) => n)

    // reset parameters if required
    let resetUnspecifiedIfRequired = (! reset)
      ? (x => x)
      : readResponses => this.readAttributesList(deviceName).then(allNames => {
          let nonChangedAttributePromises = allNames
            .filter(name => !(name in changedNames))
            .map(name => this._attributePromise(deviceName, name))
          return Promise.all(nonChangedAttributePromises)
            .then(attrs => attrs.forEach(a => a.reset()))
            .then(() => readResponses)
        })

    return Promise.all(attributeValuePairsPromises)
      .then(writeAttributeValuePairs)
      .then(resetUnspecifiedIfRequired)
  }

  readAttributeInfo(deviceName, attributeName) {
    return this._attributePromise(deviceName, attributeName).then(attribute =>
      new tangojs.AttributeInfo(attribute.info())
    )
  }

  readCommandsList(deviceName) {
    return this._devicePromise(deviceName).then(device =>
      Object.keys(device.commands)
    )
  }

  readCommandInfo(deviceName, commandName) {
    return this._commandPromise(deviceName, commandName).then(command =>
      new tangojs.CommandInfo(command.info())
    )
  }

  executeCommand(deviceName, commandName, arg, sync) {
    return this._commandPromise(deviceName, commandName).then(command => {
      let result = command.execute(arg)
      return sync
        ? new tangojs.CommandOutputResponse(now(), result)
        : undefined
    })
  }
}
