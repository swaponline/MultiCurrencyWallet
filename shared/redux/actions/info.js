import reducers from '../core/reducers'
import request from '../../helpers/request'


const fetchFaq = async () => {
  reducers.info.setFaq({ faq: { items: [], fetching: true } })
  const items = await request.get('https://wiki.swap.online/wp-json/swap/faq/')
  reducers.info.setFaq({ faq: { items, fetching: false } })
}

export default {
  fetchFaq,
}
