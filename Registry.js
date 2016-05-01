'use strict';


const redisClient = require('redis').createClient()
const messenger = require('./messenger')

const expiration = 120 // 2 minutes

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

  _now () {
    return parseInt(new Date().getTime() / 1000, 10);
  }

  registerWhatcher (queue, watcherQueue, callback){
    const aggregatedWatcherQueue = `when:${queue}`

    const addToRedisQueue = () => {
      redisClient.zadd(
        aggregatedWatcherQueue,
        this._now(),
        watcherQueue
      );
    }

    addToRedisQueue()
    setInterval(addToRedisQueue, expiration * 1000 / 2)

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

  hasExpired (timestamp) {
    return timestamp < this._now() - expiration
  }

  triggerWatchers (aggregatedWatcherQueue, payload) {
    function trigger(err, watcherQueues) {
      var counter = 0;

      for(let i = 0; i < watcherQueues.length ; i = i + 2){
        let watcherQueue = watcherQueues[i];
        let timestamp = watcherQueues[i + 1];

        if(this.hasExpired(timestamp)){
          console.log(`Deregister watcher ${watcherQueue} from ${aggregatedWatcherQueue}`)
          redisClient.zrem(aggregatedWatcherQueue, watcherQueue);
        }else{
          messenger.publish(watcherQueue, payload);
        }
      }
    }

    redisClient.zrange(
      aggregatedWatcherQueue, 0, -1, 'WITHSCORES',
      trigger.bind(this)
    )
  }
}

module.exports = Registry;