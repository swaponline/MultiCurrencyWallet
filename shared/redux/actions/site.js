import reducers from 'redux/core/reducers'

const generateTabId = () => {
  const tabId = new Date().getTime();
  reducers.site.setTabId(tabId);
  return tabId;
}

export default {
  generateTabId
}
