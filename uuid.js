'use strict'

class UUID {
  generate() {
    return this.generateBlock() + this.generateBlock() + '-' + this.generateBlock() + '-' + this.generateBlock() + '-' + this.generateBlock() + '-' + this.generateBlock() + this.generateBlock() + this.generateBlock();
  }

  generateBlock() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
}

module.exports = UUID;
