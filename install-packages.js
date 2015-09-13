var fs = require('fs');
var exec = require('child_process').exec;
var folderName = 'packages';
var jsonName = 'packages';
var defaultPackagesName = 'default';
var inactivePackagesExtension = 'inactive';

deactivateEnvs(function() {
  var envsPackagesObj = getPackagesListObj();
  var envs = envsPackagesObj.keys();
  installEnvs(envs, envsPackagesObj);
});

function installEnvs(envs, envsPackagesObj, _counter) {
  if (!_counter) _counter = 0;

  if(_counter >= envs.length) {
    return true;
  }

  var packagesFolder = folderName + '.' + envs[_counter] + '.' + inactivePackagesExtension;
  console.log('Installing enviorment ' + envs[_counter]);
  var exists = fs.existsSync(packagesFolder);
  if(!exists) {
    fs.mkdirSync(packagesFolder);
  }
  process.chdir(packagesFolder);
  decideUpdateTypeAndInstall(envsPackagesObj[envs[_counter]], function() {
    console.log('Done installing enviorment' + envs[_counter]);
    process.chdir('..');
    installEnvs(envs, envsPackagesObj, _counter + 1);
  });
}

function deactivateEnvs(callback) {
  exec('node switch-env.js disable ', function(err, stdout, stderr) {
    if (err) throw err;
    console.log(stdout);
    console.log(stderr);
    if(callback) {
      callback();
    }
  });
}

function getPackagesListObj() {
  var packagesListObj = {};
  var jsonFileListObj = {};
  jsonFileListObj[defaultPackagesName] = jsonName + '.json';

  if (process.argv.length > 2) {
    for (var i = 2; i < process.argv.length; i++) {
      jsonFileListObj[jsonName + '.' + process.argv[i] + '.json'] = process.argv[i];
    }
  }

  for (var jsonFile in jsonFileListObj.keys()) {
    fs.exists(jsonFile, function(exists){
      if(exists) {
        fs.readFile(jsonFile, function(err, data) {
          if (err) throw err;
          var parsedJson = JSON.parse(data);
          var envName = jsonFileListObj[jsonFile];
          packagesListObj[envName] = parsedJson.packages;
        });
      } else {
        console.log('Could not find ' + jsonFile + ' in directory, skipping...');
      }
    });

    return packagesListObj;
  }
}

function decideUpdateTypeAndInstall(packages, callback) {
  fs.exists('packages', function(exists) {
    if (!exists) {
      fullUpdate(packages, callback);
    } else {
      partialUpdate(packages, callback);
    }
  });
}

function fullUpdate(packages, callback, _current) {
  if (_current === null || _current === undefined) {
    _current = 0;
  }
  if (_current >= packages.length) {
    callback();
  }
  apmInstall(packages[_current], function() {
    fullUpdate(packages, callback, _current + 1);
  });
}

function partialUpdate(packages, callback, _current) {
  if (_current === null || _current === undefined) {
    _current = 0;
  }
  if (_current >= packages.length) {
    callback();
  }
  fs.exists('packages/' + packages[_current], function(exists) {
    if(!exists) {
      apmInstall(packages[_current], function() {
        partialUpdate(packages, callback, _current + 1);
      });
    } else {
      partialUpdate(packages, callback, _current + 1);
    }
  });
}

function apmInstall(packageName, callback) {
  console.log('installing ' + packageName);
  exec('apm install ' + packageName, function(err, stdout, stderr) {
    if (err) throw err;
    console.log(stdout);
    console.log(stderr);
    callback();
  });
}
