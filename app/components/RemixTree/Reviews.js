/*eslint "react/no-danger":0 */
import React               from 'react';
import { AccordianPanel }  from '../Accordian';
import Glyph               from '../Glyph';
import Modal               from '../Modal';
import Alert               from '../Alert';
import FormattedTextEditor from '../FormattedTextEditor';
import Topics              from '../../stores/topics';
import { ModelTracker,
        CollapsingModel }    from '../../mixins';

class ReviewPopup extends Modal.Popup {

  constructor() {
    super(...arguments);
    this.state = { error: '',
                   disableSubmit: true };
    this.onChange               = this.onChange.bind(this);
    this.shouldSubmitBeDisabled = this.shouldSubmitBeDisabled.bind(this);
    this.onSubmitReview         = this.onSubmitReview.bind(this);
  }

  onChange(event) {
    var value = event.target.value.trim();
    var disableSubmit = value.length === 0;
    this.setState( {disableSubmit,value} );
  }

  onSubmitReview() {
    this.setState( { error: '' } );
    this.props.store.review(this.state.value)
      .then( () => this.manualClose );
  }

  shouldSubmitBeDisabled() {
    return this.state.disableSubmit;
  }

  render() {
    return (
      <Modal action={this.onSubmitReview} 
             submitDisabler={this.shouldSubmitBeDisabled} 
             subTitle="Review"
             title={this.props.store.model.upload.name}  
             buttonText="Submit" 
             closeText="Cancel" 
             error={this.state.error}
             {...this.props}
      >
          <div className="form-group">
              <label>{"Your review:"}</label>
              <FormattedTextEditor  onChange={this.onChange} />
          </div>
      </Modal>
      );
  }  
}

const ReviewsButton = React.createClass({

  mixins: [ ModelTracker ],

  getInitialState() {
    return { disabled: false };
  },

  shouldComponentUpdate(nextProps,nextState) {
    return this.state.store.permissions.okToReview !== nextState.store.permissions.okToReview;
  },

  stateFromStore(store) {
    return {store};
  },
  
  onReview(event) {
    event.stopPropagation();
    event.preventDefault();
    ReviewPopup.show( ReviewPopup, { store: this.state.store } );
  },

  render() {
    return (
        this.state.store.permissions.okToReview && !this.state.disabled
          ? <button onClick={this.onReview} className="review pull-right"><Glyph icon="pencil" /></button>
          : null
      );
    }
});


var  Reviews = React.createClass({

  mixins: [ModelTracker,CollapsingModel],

  getInitialState() {
    return { numItems: this.props.numItems };
  },

  componentWillReceiveProps(nextProps) {
    this.setState({ numItems: nextProps.numItems });
  },

  speakNow(nextProps,nextState) {
    return this.state.numItems !== nextState.numItems;
  },

  stateFromStore(store) {
    return { id: store.model.upload.id };
  },
  
  refreshModel(store) {
    if( !this.topics ) {
      this.topics = new Topics();
    }
    var id = store ? store.model.upload.id : this.state.id;
    return this.topics.reviewsFor(id);
  },

  _renderReview(r,i) {
    return (
        <div key={i} className={'panel panel-info panel-offset-' + r.indent}>
          <div className="panel-heading">
            <h3 className="panel-title">
              {r.indent 
                ? <span><Glyph icon="arrow-circle-right" />{' ' + r.author.name}</span>
                : <span><img src={r.author.avatarURL} />{' ' + r.author.name}</span>
              }
            </h3>
          </div>
          <div className="panel-body" dangerouslySetInnerHTML={{__html: r.html}} />
          <div className="panel-footer">{r.date}</div>
        </div>
      );
  },

  render() {
    var title = `Reviews (${this.state.numItems})`;
    var revButton = <ReviewsButton store={this.props.store} />;
    return (
        <AccordianPanel disabled={!this.state.numItems} headerContent={revButton} title={title} id="reviews" icon="pencil" onOpen={this.onOpen} onClose={this.onClose} >
        {this.state.model 
          ? this.state.model.map( this._renderReview )
          : null
        }
        </AccordianPanel>
      );
  }

});

module.exports = Reviews;

//