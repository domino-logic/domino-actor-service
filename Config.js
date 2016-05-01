'use strict';


class Config {
  constructor(config){
    this.config = {}
  }

  set (config){
    Object.assign(this.config, config)
  }

  get (key){
    if(!key) return this.config
    return this.config[key]
  }
}


module.exports = new Config()