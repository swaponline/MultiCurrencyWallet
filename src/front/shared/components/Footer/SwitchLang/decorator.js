import {injectIntl as inject} from 'react-intl';

export const injectIntl = options => target=> {
  return inject(target, options);
};