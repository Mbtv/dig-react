var fs         = require('fs');
var path       = require('path');
var glob       = require('glob');
var del        = require('del');
var mkdirp     = require('mkdirp');
var rsvp       = require('rsvp');
var exec       = require('child_process').exec;

var fopen   = rsvp.denodeify(fs.open);
var fread   = rsvp.denodeify(fs.readFile);
var globp   = rsvp.denodeify(glob);
var frename = rsvp.denodeify(fs.rename);

var clog = function() {};
var log  = function() {};

function initLogs( _clog, _log ) {
  clog = _clog;
  log  = _log;
}

function rename( from, to ) {
  log( `renaming ${from} => ${to}` );
  return frename( from, to );
}

function bundleFiles(arr,destination,sortpri,sep) {
  var fd = null;
  sep = sep || '';
  clog( 'creating bundle ', destination  );
  log( ' => ', arr );
  
  return fopen(destination, 'w')
    .then( function(fileDescriptor) {
        fd = fileDescriptor;
        var hash = {};
        arr.forEach( n => hash[n] = fread(n,'utf8') );
        return rsvp.hash(hash);
      })
    .then( function(hash) {
        var data = Object.keys(hash)
                         .sort( (a,b) => a.match(sortpri) !== null ? -1 : 1 )
                         .map( k => hash[k] )
                         .join( `\n${sep}/* ccmbuildjoint */\n` );
        fs.write(fd,data);
        fs.close(fd);
      });
}

function copy(src,dest) {

  log(`copying ${src} => ${dest}`);

  fs.createReadStream(src)
    .on('error', err )
    .pipe(fs.createWriteStream(dest));
}

function err(err) {
  clog('Error : ' + err.message);
  process.exit(1);
}

function mkdir( dir ) {
  log('making dir',dir);
  mkdirp.sync(dir);
}


function execp(cmd)
{
  return new rsvp.Promise( function(success,reject) {
    exec(cmd,function(err, stdout /*, stderr*/ ) {
      if( err ) {
        clog(stdout);
        reject(err);
      } else {
        var name = cmd.split(/\s+/)[0];
        log( 'Result from: ', name, stdout || '(empty)');
        success(stdout);
      }
    });
  });
}

function tmpDir() {
  return './tmp/' + nowString() + '/';
}

function nowString() { 
  function t(n) { return Number(n) < 10 ? '0' + n : n; }
  var d = new Date(); return (1900+d.getYear())+''+t(1+d.getMonth())+t(d.getDay())+''+t(d.getHours())+t(d.getMinutes())+t(d.getSeconds())+d.getMilliseconds(); 
}

function camelize(str) {

  return str.replace(/\.[a-z]+$/,'')
             .toLowerCase()
             .split('-')
             .map( (s,i) => s.charAt(0).toUpperCase() + s.substr(1) )
             .join('');
}

function makePromises(arr) {
  return rsvp.all( arr.map( p => p() ) );
}

function generateIndexJS(appdir,dir,formatter) {
  var str = `// this file is generated by the build process \n\n`;

  var iname = `${appdir}/${dir}/index.js`;
  log( `Generating ${iname} `);
  
  var exportNames = [];

  return del( iname )
    .then( function() {
      return globp(`${appdir}/${dir}/*`);
    }).then( function(files) {
      files.forEach( f => {
        var name = path.parse(f).name;
        var rname = formatter(name);
        exportNames.push(rname);
        str += `import ${rname} from './${name}';\n`;
      });
      str += `\n\nmodule.exports = {\n    ${exportNames.join(',\n    ')} \n};\n\n`;
      log(`writing ${iname}`);
      fs.writeFileSync( iname, str, 'utf8' );
    });
}

function mkdirs(dir) {
  return new rsvp.Promise( function( success, reject  ) {
      mkdir( dir );
      success('ok');
    });
}

function publishDir(files,rootd,target) {
  return globp( files )
    .then( fnames => fnames.forEach( f => copy( f, f.replace(rootd, target) ) ) );
}

module.exports = {
 initLogs,
 rename,
 bundleFiles,
 copy,
 err,
 mkdir,
 execp,
 tmpDir,
 camelize,
 makePromises,
 generateIndexJS,
 mkdirs,
 publishDir,
};