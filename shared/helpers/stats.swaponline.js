import { request, gql } from 'graphql-request'


const addUserMut = gql`
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
      created_by
      created_at
      updated_at
      domain_at_creation
      domain_last_accessed_from
      data {
        locale
        user_description
        ip
        messaging_token
        widget_url
        wallets {
          symbol
          type
          address
          balance
          public_key
          nounce
          signatories
          signatures_required
        }
      }
    }
  }
`

const updUserMut = gql`
  mutation updUserMutation(
    $createdBy: String!,
    $domain: String!
    $data: UserDataInput
  ){
    updateUser(created_by: $createdBy, domain: $domain, data: $data) {
      id
      created_by
      created_at
      updated_at
      domain_at_creation
      domain_last_accessed_from
      data {
        locale
        user_description
        ip
        messaging_token
        widget_url
        wallets {
          symbol
          type
          address
          balance
          public_key
          nounce
          signatories
          signatures_required
        }
      }
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
    const res = await request('https://stat.swaponline.io/graphql', addUserMut, { createdBy, domain, data })
    console.log(res)
  } catch (error) {
    console.error(`Error on add user to stat.swaponline: ${error.name}`, error)
  }
}

/**
 *
 * @param {ethAddress} createdBy
 * @param {domain} domain
 * @param {json} data
 */

const updateUser = async (createdBy, domain, data) => {
  try {
    const res = await request('https://stat.swaponline.io/graphql', updUserMut, { createdBy, domain, data })
    console.log(res)
  } catch (error) {
    if (error.message.split(': {')[0] === `Cannot read property 'data' of undefined`) {
      await addUser(createdBy, domain, data)
    }
    console.error(`Error on update user to stat.swaponline: ${error.name}`, error)
  }
}

export default {
  addUser,
  updateUser,
}
