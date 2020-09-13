import { request, gql } from 'graphql-request'


const query = gql`
  # input WalletDataInput {
  #   symbol: String!
  #   type: String

  #   address: String!
  #   balance: Float

  #   public_key: String!

  #   # unesessary fields
  #   nounce: Int
  #   signatures_required: Int
  #   signatories: [String]
  # }

  # """Data consumed from user's activity"""
  # input UserDataInput {
  #   locale: String
  #   user_description: String
  #   gift_referrer: String
  #   gift: Boolean
  #   gift_date: String
  #   ip: String
  #   messaging_token: String
  #   widget_url: String
  #   wallets: [WalletDataInput]
  # }

  mutation addUserMutation(
    $createdBy: String!,
    $domain: String!
    $data: UserDataInput
  ){
    addUser(created_by: $createdBy, domain: $domain, data: $data) {
      id
    }
  }
`

/**
 *
 * @param {ethAddress} createdBy
 * @param {domain} domain
 * @param {json} data
 */

const addUser = async (createdBy, domain, data) => {
  try {
    const res = await request('https://stat.swaponline.io/graphql', query, { createdBy, domain, data })
    console.log(res)
  } catch (error) {
    console.error(`Error on add user to stat.swaponline: ${error.name}`, error)
  }
}

export default {
  addUser,
}
