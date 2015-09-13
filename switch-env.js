var fs = require('fs');
var folderName = 'packages';
var defaultPackagesName = 'default';
var inactivePackagesExtension = 'inactive';
var activePackagesExtension = 'active';

readArgsAndExeculte();

function readArgsAndExeculte() {
  if(process.argv.length > 2) {
    if(process.argv[2].toUpperCase() === 'DISABLE') {
      deactivateEnvs();
    } else {
      activateEnvs();
    }
  } else {
    activateDefault();
  }
}

function deactivateEnvs() {
  if(process.argv.length === 3) {

  }
}

function deactivateEnv(envName) {
  fs.exists(folderName + '.' + envName + '.' + activePackagesExtension, function(exists) {

  });
}
