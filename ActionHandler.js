'use strict'

const Dispatcher = require('./Dispatcher')
const Registry = require('./Registry')
const redisClient = require("redis").createClient()
const DRM = require('domino-rabbitmq-messenger')


class ActionHandler {
  constructor (options) {
    this.options = options || {}
    this.actionQueue = this.options.actionQueue || 'domino_action'
    this.dispatchQueue = this.options.dispatchQueue || 'domino_dispatch'
    this.messenger = new DRM.Messenger(this.options)
  }

  start (callback) {
    this.messenger.start( (err, messenger) => {
      if(err && callback) return callback(err)

      const options = Object.assign({}, this.options, {messenger})

      this.registry = new Registry(options)
      this.dispatcher = new Dispatcher(options)

      console.log(`ActionHandler is ready...`)

      if(callback) callback(null, this)
    })
  }

  getActionQueue (actionName) {
    return `${this.actionQueue}.${this.domainName}.${actionName}`
  }

  getDispatchQueue (actionName) {
    return `${this.dispatchQueue}.${this.domainName}.${actionName}`
  }

  domain (domainName) {
    this.domainName = domainName
    return this
  }

  actor (name, callback) {
    const dispatch = this.dispatcher.getDispatcherFor(this.domainName)

    this.registry.registerActor(
      this.getActionQueue(name),
      function(body){
        callback(body, dispatch)
      }
    )
    return this
  }

  watcher (name, funcName, callback) {
    if (arguments.length == 2) {
      name = arguments[0]
      funcName = arguments[1].name
      callback = arguments[1]
    }

    if (!funcName) {
      throw new Error('ActionHandler.watcher(...): Cannot guess function name')
    }

    if (!callback) {
      throw new Error('ActionHandler.watcher(...): Callback is missing')
    }

    this.registry.registerWhatcher(
      this.getDispatchQueue(name),
      `${this.getDispatchQueue(name)}.${funcName}`,
      callback
    )

    return this
  }

}

module.exports = ActionHandler
