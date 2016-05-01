const Messenger = require('Messenger')


class Dispatcher {
  constructor (options) {
    this.options = options || {};
    this.dispatch_queue = this.options.dispatch_queue || 'domino_dispatch';
  }

  getDispatchQueue (domainName, actionName) {
    return `${this.dispatch_queue}.${domainName}.${actionName}`
  }

  getDispatcherFor(domainName) {
    if(!domainName) {
      throw new Error('Dispatcher.getDispatcherFor(...): domain is missing');
    }

    return (actionName, payload) => {
      if(!actionName) {
        throw new Error('Dispatcher.dispatch(...): action is missing');
      }

      this.messenger.publish(
        getDispatchQueue(domainName, actionName),
        payload
      )
    }

  }

}