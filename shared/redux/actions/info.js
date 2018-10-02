import reducers from '../core/reducers'
import request from '../../helpers/request'


const getFaq = async () => {
  reducers.info.setFaq({ faqList: [] })
  const faqList = await request.get('https://wiki.swap.online/wp-json/swap/faq/')
  reducers.info.setFaq({ faqList })
}

export default {
  getFaq,
}
