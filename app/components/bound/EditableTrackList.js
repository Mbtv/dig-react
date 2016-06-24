import React               from 'react';
import {ModelTracker}      from '../../mixins';
import EditableTrackList   from '../models/EditableTrackList';

/*
  Present a tracklist that is optionally editable including sorting

  Props
    store   := object from [stores/uploads] assumes model.items[]
    canEdit := boolean true mean show edit controls and allow for editing

  sourced events
    onDelete(model)  - user clicked on 'delete' button
    onPlay(model)    - user clicked on 'play' button 
    onSort(sortkeys) - user is done sorting tracks   
*/
class BoundEditableTrackList extends ModelTracker.extender(React.Component)
{
  stateFromStore(store) {
    return { model: store.model };
  }

  render() {
    return <EditableTrackList model={this.state.model} {...this.props} />;
  }
}

module.exports = BoundEditableTrackList;

//