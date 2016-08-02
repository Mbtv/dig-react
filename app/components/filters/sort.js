import Filter    from '../../models/filters/sort';
import Select    from '../properties/controls/select';

class SortFilter extends Select
{
}

SortFilter.defaultProps = { 
  Property: Filter, 
  options: Filter.options, 
  id: 'sort' 
};

module.exports = SortFilter;