import React    from 'react';
import ReactDOM from 'react-dom';
import Glyph    from './Glyph';

import pagingStats from '../unicorns/pagingStats';

var router = null;

/* global $ */

var BoundingMixin = {

  componentDidMount: function() {
    if( !global.IS_SERVER_REQUEST ) {
      var $e = $(ReactDOM.findDOMNode(this));
      if( $e.is(':visible') ) {
        if( this.props.keepAbove ) {
          this.setupBump( $e, $(this.props.keepAbove), true );
        }
        if( this.props.keepBelow ) {
          this.setupBump( $e, $(this.props.keepBelow), false );
        }
        window.addEventListener('resize', this.handleResize);
      }
    }
  },

  componentWillUnmount: function() {
    if( !global.IS_SERVER_REQUEST ) {
      window.removeEventListener('resize', this.handleResize);
      var $e = $(ReactDOM.findDOMNode(this));
      ['a', 'b'].forEach( k => {
        var f = 'keep-between-'+k;
        if( $e.data(f) ) {
          $(window).off('scroll',$e.data(f));
          $e.data(f,null);
        }
      });
    }
  },

  handleResize: function() {
    var $e = $(ReactDOM.findDOMNode(this));
    ['a', 'b'].forEach( k => {
      var f = 'keep-between-'+k;
      if( $e.data(f) ) {
        $e.data(f)();
      }
    });
  },

  setupBump: function($e,$bumper,isKeepAbove) {
    
    if( !$e.is(':visible') ) {
      return;
    }
    
    var eHeight      = $e.outerHeight() + 3;      
    var propName     = 'keep-between-' + (isKeepAbove ? 'a' : 'b');
    
    $e.data( propName, function() {
      // we have to do this stuff in the event handler
      // because DOM
      var bumperHeight = $bumper.outerHeight() + 3;
      var bumperTop    = $bumper.offset().top;
      var top          = Number($e.css('top').replace(/[^-\d\.]/g, ''));
      var bumperPos    = bumperTop - $(window).scrollTop();
      
      if( isKeepAbove ) {
        if( top + eHeight > bumperPos) {
          $e.css( { top: (bumperPos-eHeight) + 'px' } );
        }
      } else { 
        if( top < bumperPos + bumperHeight ) {
          $e.css( { top: (bumperPos + bumperHeight) + 'px' } );
        }
      }
    });  

    $(window).scroll( $e.data(propName) );

    $e.data(propName)();
  },

};

const PagerLink = React.createClass({

  onClick: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this.props.newOffset(this.props.offset);

  },

  render: function() {
    var icon = this.props.icon;
    var cls  = this.props.show ? '' : 'disabled';
    var href = '?offset=' + this.props.offset;

    return (<li className={cls}>
              {this.props.show
                ? <a href={href} onClick={this.onClick}><Glyph x2 icon={icon} /></a>
                : <a href><Glyph x2 icon={icon} /></a>
              }
            </li>);
  },

});


const Paging = React.createClass({

  mixins: [BoundingMixin],

  getDefaultProps: function() {
    return {
      keepAbove: '.footer',
      keepBelow: '.page-header'
    };
  },

  componentWillMount: function() {
    var store = this.props.store;
    var state = this.stateFromStore();
    store.on('playlist',this.onPlaylist);
    this.setState(state);
  },
  
  componentWillUnmount: function() {
    this.props.store.removeListener('playlist',this.onPlaylist);
  },

  stateFromStore: function() {
    var store = this.props.store;
    var model = store.model;
    return {
        offset: store.queryParams.offset,
        limit: store.queryParams.limit,
        length: model.playlist.length,
        total: model.total      
    };
  },

  onPlaylist: function() {
    var state  = this.stateFromStore();
    setTimeout( () => this.setState(state), 50 );
  },

  onNewOffset: function(offset) {
    // Trigger a new query()
    this.props.store.applyParams( { offset: offset } );
    // for now ...
    if( !router ) {
      router = require('../services/router');
    }
    router.setBrowserAddressBar('?offset='+offset);
  },
  
  render: function() {
    var s = pagingStats(this.state);
    
    if( !s.shouldShow ) {
      return null;
    }
    
    return(
      <div className="paging">
        <ul className="pagination">  
          <PagerLink newOffset={this.onNewOffset} offset="0"            show={s.showFirst} icon="angle-double-left" />
          <PagerLink newOffset={this.onNewOffset} offset={s.prevValue}  show={s.showPrev}  icon="arrow-left" />
          <PagerLink newOffset={this.onNewOffset} offset={s.nextValue}  show={s.showNext}  icon="arrow-right" />
          <PagerLink newOffset={this.onNewOffset} offset={s.lastPage}   show={s.showLast}  icon="angle-double-right" />
        </ul>
        <div className="center-text">{s.printableOffset + ' - ' + s.printableLastValue + ' of ' + s.printableTotal}</div>
      </div>
      );
  },

});

module.exports = Paging;

