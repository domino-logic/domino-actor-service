'use strict';

const Dispatcher = require('./Dispatcher')
const Registry = require('./Registry')
const redisClient = require("redis").createClient()


class ActionHandler {
  constructor (options) {
    this.options = options || {};

    this.registry = new Registry(this.options)
    this.dispatcher = new Dispatcher(this.options)

    this.action_queue = this.options.action_queue || 'domino_action';
    this.dispatch_queue = this.options.dispatch_queue || 'domino_dispatch';
  }

  getActionQueue (actionName) {
    return `${this.action_queue}.${this.domainName}.${actionName}`
  }

  getDispatchQueue (actionName) {
    return `${this.dispatch_queue}.${this.domainName}.${actionName}`
  }

  dispatch (actionName, payload) {
    this.dispatcher.dispatch(
      this.domainName,
      actionName,
      payload
    )
  }

  domain (domainName) {
    this.domainName = domainName;
    return this;
  }

  actor (name, callback) {
    this.registry.registerActor(
      this.getActionQueue(name),
      callback.bind(
        this,
        this.dispatcher.getDispatcherFor(this.domainName)
      )
    );
    return this;
  }

  watcher (name, funcName, callback) {
    if (arguments.length == 2) {
      name = arguments[0];
      funcName = arguments[1].name;
      callback = arguments[1];
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
    );

    return this;
  }

}

module.exports = ActionHandler
