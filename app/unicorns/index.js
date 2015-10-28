
if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}

if( typeof Array.prototype.includes === 'undefined' ) {
  Array.prototype.includes = function(v) { return this.indexOf(v) !== -1; };
}

if( typeof Array.prototype.contains === 'undefined' ) {
  Array.prototype.contains = Array.prototype.includes;
}

if( typeof Array.prototype.findBy === 'undefined' ) {
  Array.prototype.findBy = function(key,value) {
    for( var i = 0; i < this.length; i++ ) {
      if( this[i][key] == value ) {
        return this[i];
      }
    }
    return null;
  };
}

if( typeof Array.prototype.filter === 'undefined' ) {
  Array.prototype.filter = function(cb) {
    var results = [];
    for( var i = 0; i < this.length; i++ ) {
      if( cb( this[i], i ) ) {
        results.push(this[i]);
      }
    }
    return results;
  };

}

if( typeof Array.prototype.rejectBy === 'undefined' ) {
  Array.prototype.rejectBy = function(key,value) {
    return this.filter( function(obj) {
      return obj[key] != value;
    });
  };
}

function decamlize(str) {
  return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/(-|\s+)/g, '_')
            .toLowerCase();
}

function dasherize(str) {
  return decamlize(str).replace(/_/g,'-');
}

function underscore(str) {
  return w(trim(str)).join('_');
}

function commaize(value) {
  if( value === 0 || value === '0' ) {
      return '0';
  } else if( value ) {
      var regex = /([0-9]+)(([0-9]{3})($|,))/g;
      var str;
      var commaized = (value.string || value) + '';

      do {
          str = commaized;
          commaized = str.replace(regex,'$1,$2');
      } while( str !== commaized );

      return commaized;
  }
}

function trim(s) { 
  return s.replace(/^\s+/,'').replace(/\s+$/,''); 
}

function w(s) {
  return s.split(/\s+/);
}

var oassign = Object.assign || function (target,...sources) 
{ 
  sources.forEach( function(source) {
    for (var key in source) { 
      if (Object.prototype.hasOwnProperty.call(source, key)) { 
        target[key] = source[key]; 
      } 
    }
  });
  
  return target; 
};

// cribbed from '_'
var debounce = function(func, wait, immediate) {
  var timeout, args, context, timestamp, result;

  var later = function() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      }
    }
  };

  return function() {
      context = this;
      args = arguments;
      timestamp = Date.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
};

module.exports = {
  commaize,
  oassign,
  dasherize,
  decamlize,
  trim,
  w,
  underscore,
  debounce
};