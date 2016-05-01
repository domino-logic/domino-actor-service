'use strict'


class Dispatcher {
  constructor (options) {
    this.messenger = options.messenger
    this.dispatchQueue = options.dispatchQueue || 'domino_dispatch'
  }

  start (callback) {
    this.messenger.start( (err, messenger) => {
      if(err && callback) return callback(err)

      console.log(`Dispatcher is ready...`)

      if(callback) callback(null, this)
    })
  }

  getDispatchQueue (domainName, actionName) {
    return `${this.dispatchQueue}.${domainName}.${actionName}`
  }

  getDispatcherFor(domainName) {
    if(!domainName) {
      throw new Error('Dispatcher.getDispatcherFor(...): domain is missing')
    }

    return (actionName, payload) => {
      console.log(`dispatching ${actionName}:`, payload)

      if(!actionName) {
        throw new Error('Dispatcher.dispatch(...): action is missing')
      }

      this.messenger.publish(
        this.getDispatchQueue(domainName, actionName),
        {payload, actionName}
      )
    }

  }

}

module.exports = Dispatcher