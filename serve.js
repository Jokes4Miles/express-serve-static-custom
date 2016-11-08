var mime = require('mime'),
    fs = require('fs');
/**
 * Express middleware that serves static gzipped assets if they are available with specified max-age
 * @param  {String} assetPath    where the assets are stored
 * @param  {String} cacheControl time in seconds the asset is to be cached ex: 'public, max-age=512000'
 * @param  {RegExp} exclusion    regex used to match filepaths to exclude
 * @return {function}
 */
module.exports = function(assetPath,cacheControl,exclusion) {
  /**
   * Executed when called by express
   * @param  {Object}   req  request from express
   * @param  {Object}   res  response from express
   * @param  {Function} next next in express
   */
  return function(req, res, next) {
    var acceptEncodingsString = req.get('Accept-Encoding'),
        originalPath = req.path;
    res.setHeader('Cache-Control', cacheControl);
    if(!exclusion.test(originalPath) && typeof acceptEncodingsString != 'undefined') {
      var acceptEncodings = acceptEncodingsString.split(", ");
      try {
        var stats = fs.statSync(`${assetPath}${originalPath}.gz`);
        if(acceptEncodings.indexOf('gzip') >= 0 && stats.isFile()) {
          res.setHeader('Content-Encoding', 'gzip');
          res.setHeader('Vary', 'Accept-Encoding');
          req.url = `${req.url}.gz`;
          var type = mime.lookup(`${assetPath}${originalPath}`);
          if (typeof type != 'undefined') {
            var charset = mime.charsets.lookup(type);
            res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
          }
        }
      } catch(e) {
        console.log(`GZIP - ERROR - ${assetPath}${originalPath}.gz`);
      }
    }
    next();
  }
};
