'use strict';


const redisClient = require('redis').createClient()
const messenger = require('./messenger')


class Registry {
  constructor (options) {
    this.options = options || {};
    this.action_queue = this.options.action_queue || 'domino_action'
    this.dispatch_queue = this.options.dispatch_queue || 'domino_dispatch'
  }

  registerActor (queue, callback) {
    messenger.consume(queue, callback);
    console.log(`Registered actor on ${queue}`)
  }

  registerWhatcher (queue, watcherQueue, callback){
    const aggregatedWatcherQueue = `when:${queue}`

    redisClient.sadd(aggregatedWatcherQueue, watcherQueue);

    messenger.consume(
      queue,
      this.triggerWatchers.bind(this, aggregatedWatcherQueue)
    );

    messenger.consume(
      watcherQueue,
      callback.bind(this)
    );

    console.log(`Registered watcher on ${queue}`)
  }

  triggerWatchers (aggregatedWatcherQueue, payload) {
    function trigger(watcherQueue) {
      messenger.publish(watcherQueue, payload)
    }

    redisClient.smembers(
      aggregatedWatcherQueue,
      (err, watcherQueues) => watcherQueues.forEach(trigger)
    )
  }
}

module.exports = Registry;