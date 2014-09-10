module.exports = Logger;

function Logger(verbose) {
  this._verbose = verbose;
}

Logger.prototype.info = function () {
  if (this._verbose) {
    var args = Array.prototype.slice.call(arguments);
    console.log.apply(console.log, args);
  }
};