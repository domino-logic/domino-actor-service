'use strict'


class Response {
  constructor(messenger, msg) {
    this.messenger = messenger
    this.queue = msg.properties.replyTo
    this.corr = msg.properties.correlationId
  }

  send (msg) {
    if(this.queue){
      this.messenger.publish(this.queue, msg)
    }
  }

  ok (payload) {
    this.send({
      status: 'ok',
      correlationId: this.corr,
      content: payload
    })
  }

  notify (payload) {
    this.send({
      status: 'notify',
      correlationId: this.corr,
      content: payload
    })
  }

  error (payload) {
    this.send({
      status: 'error',
      correlationId: this.corr,
      content: payload
    })
  }
}

module.exports = Response