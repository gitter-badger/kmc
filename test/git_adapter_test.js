var Promise = require('bluebird');
var should = require('should');
var chdir = require('chdir');
var temp = Promise.promisifyAll(require('temp').track());
var fs = Promise.promisifyAll(require('fs'));
var ChildProcess = Promise.promisifyAll(require('child_process'));

var GitAdapter = require('../lib/git_adapter');

describe('GitAdapter', function() {
  var execInPath = function(path, cmd) {
    return ChildProcess.execAsync('cd ' + path + ';' + cmd);
  }

  // A promise to set up the KSP directory for testing. Make sure this promise
  // returns the temporary directory created.
  var setUpKspPath = temp.mkdirAsync('ksp').then(function(tempDir) {
    return fs.writeFileAsync(tempDir + '/a.txt', 'lorem').then(function() {
      return tempDir;
    });
  });

  // A promise to set up KSP and init in the tempdir. Returns the tempdir.
  var initAndChdir = setUpKspPath.then(function(tempDir) {
    return GitAdapter.initRepo(tempDir).then(function() {
      return tempDir;
    });
  });

  describe('#initRepo', function() {
    it('creates a repo at the path passed', function(done) {
      initAndChdir.then(function(tempDir) {
        var inGitDir = 'git rev-parse --is-inside-work-tree';

        execInPath(tempDir, inGitDir).then(function(stdout, stderr) {
          stdout.join('').should.eql('true\n');

          done();
        });
      });
    });
  });

  describe('#commitEverything', function() {
    it('commits everything as the KMC user', function(done) {
      var tempDir;

      initAndChdir.then(function(kspTempDir) {
        tempDir = kspTempDir;

        return GitAdapter.commitEverything(tempDir, 'Test message');
      }).then(function() {
        // Count how many commits have been made.
        return execInPath(tempDir, 'git rev-list HEAD --count');
      }).then(function(stdout, stderr) {
        parseInt(stdout).should.eql(1);
        done();
      });
    });
  });
});
