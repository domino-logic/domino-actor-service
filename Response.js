'use strict'


class Response {
  constructor(messenger, properties) {
    this.messenger = messenger
    this.queue = properties.replyTo
  }

  send (msg) {
    if(this.queue){
      this.messenger.publish(this.queue, msg)
    }
  }

  ok (payload) {
    this.send({status: 'ok', content: payload})
  }

  error (payload) {
    this.send({status: 'ok', content: payload})
  }
}

module.exports = Response