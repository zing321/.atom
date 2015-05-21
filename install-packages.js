var fs = require('fs');
var exec = require('child_process').exec;

fs.readFile('packages.json', function(err, data) {
  if (err) throw err;
  var parsedJson = JSON.parse(data);
  var packages = parsedJson.packages;

  fs.exists('packages', function(exists) {
    if (!exists) {
      fullUpdate(packages);
    } else {
      partialUpdate(packages);
    }
  });
});

function fullUpdate(packages, _current) {
  if (_current === null || _current === undefined) {
    _current = 0;
  }
  if (_current >= packages.length) {
    return true;
  }
  apmInstall(packages[_current], function() {
    fullUpdate(packages, _current + 1);
  });
}

function partialUpdate(packages, _current) {
  if (_current === null || _current === undefined) {
    _current = 0;
  }
  if (_current >= packages.length) {
    return true;
  }
  fs.exists('packages/' + packages[_current], function(exists) {
    if(!exists) {
      apmInstall(packages[_current], function() {
        partialUpdate(packages, _current + 1);
      });
    } else {
      partialUpdate(packages, _current + 1);
    }
  });
}

function apmInstall(packageName, callback) {
  exec('apm install ' + packageName, function(err, stdout, stderr) {
    if (err) throw err;
    console.log(stdout);
    console.log(stderr);
    callback();
  });
}
