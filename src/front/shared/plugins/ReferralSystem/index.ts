import axios from 'axios'
import config from 'helpers/externalConfig'
/*
window.WPuserUid = 1;
window.WPuserHash = 'b4bc15da219c32313258b75e4f686313';
window.SO_ReferralSystem_Enabled = true;
window.SO_ReferralSystem_GenerateLinkUrl = 'https://localhost.feo.crimea/wallet/wp-admin/admin-ajax.php?action=mcwallet_ref_system_generate_link';
window.SO_ReferralSystem_StatisticUrl = 'https://localhost.feo.crimea/wallet/wp-admin/admin-ajax.php?action=mcwallet_ref_system_info';
window.SO_ReferralSystem_CheckLink = 'https://localhost.feo.crimea/wallet/wp-admin/admin-ajax.php?action=mcwallet_ref_system_check'
console.log('>>> Included ref system')
console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
*/
const Ref_Test = () => {
  console.log('>>>>', config.opts.WPuserHash)
  axios.post(
    window.SO_ReferralSystem_CheckLink,
    {
      WPuserUid: config.opts.WPuserUid,
      WPuserHash: config.opts.WPuserHash,
    }
  ).then((res: any) => {
    console.log('>>>', res?.data)
  }).catch((err) => {
    console.log('>>> fail', err)
  })
}
export const GenerateJoinLink = (options) => {
  return new Promise((resolve, reject) => {
    const { userAddress } = options
    if (config.opts.plugins.GenerateJoinLink
      && config.opts.WPuserUid
      && config.opts.WPuserHash
      && config.opts.plugins.ReferralEnabled
    ) {
      axios.post(
        config.opts.plugins.GenerateJoinLink,
        {
          WPuserUid: config.opts.WPuserUid,
          WPuserHash: config.opts.WPuserHash,
          address: userAddress
        }
      ).then((res: any) => {
        if (res
          && res?.data
          && res?.data?.answer
          && res?.data?.answer == 'ok'
          && res?.data?.url
        ) {
          resolve(res?.data?.url)
        } else {
          reject()
        }
      }).catch((err) => {
        reject()
      })
    } else {
      reject('not_inited')
    }
  })
}
export const GetReferralStatistic = () => {
  return new Promise((resolve, reject) => {
    if (config.opts.plugins.ReferralStatisticUrl
      && config.opts.WPuserUid
      && config.opts.WPuserHash
      && config.opts.plugins.ReferralEnabled
    ) {
      axios.post(
        config.opts.plugins.ReferralStatisticUrl,
        {
          WPuserUid: config.opts.WPuserUid,
          WPuserHash: config.opts.WPuserHash
        }
      ).then((res: any) => {
        if (res
          && res?.data
          && res?.data?.answer
        ) {
          resolve(res?.data)
        } else {
          reject()
        }
      }).catch((err) => {
        reject(err)
      })
    } else {
      reject('not_inited')
    }
  })
}
window.Ref_Test = Ref_Test
window.GenerateJoinLink = GenerateJoinLink
window.GetReferralStatistic = GetReferralStatistic


export default {
  GenerateJoinLink,
  GetReferralStatistic
}