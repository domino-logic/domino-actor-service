'use strict';

class Dispatcher {
  constructor (options) {
    this.messenger = options.messenger;
    this.dispatch_queue = options.dispatch_queue || 'domino_dispatch';
  }

  getDispatchQueue (domainName, actionName) {
    return `${this.dispatch_queue}.${domainName}.${actionName}`
  }

  getDispatcherFor(domainName) {
    if(!domainName) {
      throw new Error('Dispatcher.getDispatcherFor(...): domain is missing');
    }

    return (actionName, payload) => {
      console.log(`dispatching ${actionName}:`, payload)

      if(!actionName) {
        throw new Error('Dispatcher.dispatch(...): action is missing');
      }

      this.messenger.publish(
        this.getDispatchQueue(domainName, actionName),
        {payload, actionName}
      )
    }

  }

}

module.exports = Dispatcher;