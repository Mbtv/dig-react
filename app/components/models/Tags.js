import React            from 'react';
import Glyph            from '../vanilla/Glyph';
import ClearButton      from '../vanilla/ClearButton';
import InlineCSS        from '../vanilla/InlineCSS';
import { FormItem }     from '../vanilla/Form';
import { TagString,
         selectors }    from '../../unicorns';

/*
  In this context 'static' means non-interactive
  on the page.

  Use cases for displaying static tags

      scenario            query    store
    -------------------  -------  ----------
    = static playlist       x      playlist
    - upload                x      upload

  Uses cases for editing  tags:

      scenario            query    store
    -------------------  -------  ----------
    - stems browsing        ✓      uploads
    - dig tag search        ✓      uploads
    - dynamic playlist      ✓      playlist
    = static playlist       x      playlist
    - upload                x      upload
    - admin                 x      tags

  Complient stores:

    Properties:
      tags [TagString] - read/write
      permissions.canEdit - read only

    Methods:
      toggleTag(tag,toggle)
      clearTags()

    Events source:
      TAGS_SELECTED

  See DelayedCommitTagStore for the minimum API
  required for bound components.

*/

/*
  Props: 
    - model {
              id: 'tag_name'
              count: usage_count (optional)
             }
    - onSelected(model,boolean) [callback] (optional)
    - selected [boolean] (optional)
    - glyph [string-enum]  <-- N.B. singluar
        : none (default)
        : checks
        : x

  className is not settable.
    It will be one of:

      'tag-selectable' 
      'tag-selectable-checks'
      'tag-selectable-x'

    depending on the 'glyphs' property

    The 'tag-selected' selector is added 
    depending on state in all cases

*/

class SelectableTag extends React.Component
{
  constructor() {
    super(...arguments);
    this.state = this.calcState(this.props);
    this.onClick = this.onClick.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState( this.calcState(props) );
  }

  shouldComponentUpdate(nextProps,nextState) {
    return this.state.selected !== nextState.selected;
  }

  onClick(e) {
    e.stopPropagation();
    e.preventDefault();
    this.props.onSelected(this.props.model.id,!this.state.selected);
  }

  calcState(props) {
    return { selected: props.selected };
  }

  render() {
    const { model: {id,count=0}, glyph, onSelected } = this.props;
    const { selected } = this.state;
    
    const icon = glyph === 'checks'
                  ? (selected ? 'check-square-o' : 'square-o')
                  : glyph === 'x' 
                    ? 'times-circle'
                    : null;

    const cls = selectors(
                  'tag-selectable',
                  glyph && glyph !== 'none' ? 'tag-selectable-' + glyph : null,
                  selected ? 'tag-selected' : null );
    return (
        <li className={cls} onClick={onSelected && this.onClick}>
          {icon && id && <Glyph icon={icon} />}
          {id} 
          {count
            ? <span className="light-color">{"("}{count}{")"}</span>
            : null
          }
        </li>
      );
  }

}

SelectableTag.css = `
.tag-selectable > i.fa {
  margin-right: 6px;
  vertical-align: middle;
  display: inline-block;
}
.tag-selectable > span.light-color {
  margin-left: 4px;
}
`;

/*
  Props: 
    - model array[model {
              id: 'tag_name'
              count: usage_count (optional)
             }]
    - selected TagString
    - onSelected(model) [callback] (optional)
    - floating [boolean] (optional default:false)
    - autoclear [boolean] (optional default:false)
    - className [string] (optional - added to 'tag-list-selectable')
    - glyphs [string-enum] <-- N.B. plural
        : none (default)
        : checks
        : x
*/

function modelsToTagString(arr) {
  if( arr instanceof TagString ) {
    return new TagString(arr);
  }
  return new TagString(arr && arr.map(t => t.id));
}

function tagStringToModels(tagStr) {
  if( !(tagStr instanceof TagString) ) {
    return tagStr;
  }
  return (tagStr && tagStr.map( t => { return { id: t }; } )) || [];
}

class SelectableTagList extends React.Component
{
  constructor() {
    super(...arguments);
    this.state = this.calcState(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState( this.calcState(props) );
  }

  shouldComponentUpdate(nextProps,nextState) {
    const { selected, _tags } = this.state;
    return !selected.isEqual(nextState.selected) || !_tags.isEqual(nextState._tags);
  }

  calcState(props) {
    return { selected: props.selected || new TagString(),
             _tags:    modelsToTagString(props.model),
             tags:     tagStringToModels(props.model) };
  }

  render() {

    const { floating, autoclear, className, glyphs, onSelected } = this.props;
    const { tags, selected } = this.state;

    const cls = selectors(
                  'tag-list-selectable',
                  floating ? 'floating' : null,
                  autoclear ? 'autoclear' : null,
                  className );

    let arr = autoclear 
                    ? ( arr = tags.slice(), arr.push({id:''}), arr ) 
                    : tags;

    return (
      <ul className={cls}>{arr.map( tag => 
          <SelectableTag  key={tag.id} 
                          selected={selected.containsOne(tag.id)} 
                          model={tag} 
                          glyph={glyphs}
                          onSelected={onSelected}
          />)}
      </ul>
    );
  }
}

SelectableTagList.css = SelectableTag.css + `
  ul.tag-list-selectable {
    padding: 0px;
    margin: 0px;
  }
  ul.tag-list-selectable.floating > li {
    float: left;
    margin-left: 5px;     
  } 
  ul.tag-list-selectable.autoclear > li:last-child {
    float: none;
    clear: both;
  }
`;

/*
  Props: 
    - model TagString OR
            array[model {
              id: 'tag_name'
              count: usage_count (optional)
             }]
    - className [string] (optional - added to 'tag-list-static')
    - floating [boolean] (optional default:true)
    - autoclear [boolean] (optional default:true)
*/

class StaticTagsList extends React.Component
{
  constructor() {
    super(...arguments);
    this.state = this.calcState(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState( this.calcState(props) );
  }

  calcState(props) {
    var model = props.model instanceof TagString ? tagStringToModels(props.model) : props.model;
    return { model };
  }

  render() {
    const { className, css = StaticTagsList.css, glyphs, floating, autoclear } = this.props;
    const cls = selectors( 'tag-list-static', className );

    return (
        <div className="tag-list-static-container">
          <InlineCSS css={css} id="tag-list-static-css" />
          <SelectableTagList 
            model={this.state.model} 
            className={cls}
            glyphs={glyphs}
            floating={floating}
            autoclear={autoclear}
          />
      </div>
      );
  }
}

StaticTagsList.defaultProps = { floating: true, autoclear: true };
StaticTagsList.css = SelectableTagList.css;


/*
  Props: 
    - model TagString OR
            array[model {
              id: 'tag_name'
              count: usage_count (optional)
             }]
    - className [string] (optional - added to 'tag-list-static')
    - floating [boolean] (optional default:true)
    - autoclear [boolean] (optional default:true)
*/
function StaticTagsField(props)
{
    return(
        <FormItem title="tags" wrap>
          <StaticTagsList {...props} />
        </FormItem>
      );
}

/*
  Props: 
    - model array[model {
              id: 'tag_name'
              count: usage_count (optional)
             }]
    - onSelected [callback]
    - selected TagString
    - className [string] (optional - added to 'tag-list-checkable')
    - css [string] (note: inline css - set CheckableTagsList.css to destroy defaults)
*/
function CheckableTagsList(props)
{
  const { model, className, css = CheckableTagsList.css, selected, onSelected } = props;
  const cls = selectors( 'tag-list-checkable', className );

  return (
      <div className="tag-list-checkable-container">
        <InlineCSS css={css} id="tag-list-checkable-css" />
        <SelectableTagList 
          model={model} 
          selected={selected}
          className={cls}
          glyphs="checks"
          onSelected={onSelected}
        />
      </div>
    );
}

CheckableTagsList.css = SelectableTagList.css + `
.tag-list-checkable-container {
  overflow: scroll;
  background-color: rgba(96, 125, 139, 0.08);
  border-radius: 8px;
}
.tag-list-checkable li.tag-selectable-checks {
    padding: 0 4px;
    margin-bottom: 3px;
    margin-right: 12px;
    cursor: pointer;
    border: 1px solid transparent;
}
.tag-list-checkable .tag-selectable-checks:hover {
  border: 1px solid #888;
  border-radius: 4px;  
}

`;

/*
  Props: 
    - model TagString
    - onRemoved [callback]
    - onClear [callback]
    - className [string] (optional - added to 'tag-list-selected')
    - css [string] (note: inline css - set CheckableTagsList.css to destroy defaults)
*/

class SelectedTagList extends React.Component
{
  constructor() {
    super(...arguments);
    this.onSelected = this.onSelected.bind(this);
    this.state = this.calcState(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState( this.calcState(props) );
  }

  calcState(props) {
    return { tags: tagStringToModels(props.model),
             model: props.model  };
  }

  onSelected(tag) { 
    this.props.onRemove(tag);
  }

  render() {
    const { className, css = SelectedTagList.css, onClear } = this.props;
    const { model } = this.state;
    const cls = selectors( 'tag-list-selected', className );

    return (
        <div className="tag-list-selected-container">
          <InlineCSS css={css} id="tag-list-selected-css" />
          <SelectableTagList 
            model={tagStringToModels(model)} 
            selected={model}
            onSelected={this.onSelected}
            className={cls}
            glyphs="x"
            floating
          />
          {this.state.model.length > 1 && (<ClearButton className="btn-xs tags-clear" onClear={onClear} />)}
          <div className="clearfix" />
      </div>
      );
  }
}

SelectedTagList.css = SelectableTagList.css + `
.tag-list-selected-container {
  padding-bottom: 12px;
}
.tag-list-selected > li.tag-selectable-x {
  font-size: 12px;
  display: inline-block;
  border-radius: 5px;
  background-color: #DDD;
  padding: 6px;
  vertical-align: center;
  margin-right: 8px;
  margin-bottom: 8px;
  color: #555;
}

.tag-list-selected > li.tag-selectable-x i.fa {
  font-size: 13px;  
}

.tag-list-selected > li.tag-selectable-x:hover {
  background: red;
  color: white;
  cursor: default;
}
`;

module.exports = {
  SelectableTag,
  SelectableTagList,
  StaticTagsList,
  CheckableTagsList,
  SelectedTagList,
  StaticTagsField,
};

//