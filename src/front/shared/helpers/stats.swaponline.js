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

let serverBaseUrl = 'http://localhost:5050/graphql'
if (process.env.NODE_ENV === 'production') {
  serverBaseUrl = 'https://stat.swaponline.io/graphql'
}

const addUser = async (createdBy, domain, data) => {
  try {
    const res = await request(serverBaseUrl, addUserMut, { createdBy, domain, data })
    console.log(res)
    return res
  } catch (error) {
    console.error('Error on add user to stat.swaponline:', error)
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
    const res = await request(serverBaseUrl, updUserMut, { createdBy, domain, data })
    console.log(res)
    return res
  } catch (error) {
    if (
      !error.response.data &&
      error.response.errors[0].message === 'This user does not exists' &&
      error.response.errors[0].extensions.code === 'UNAUTHENTICATED'
    ) {
      console.warn('Error on update user to stat.swaponline, trying to add user instead...', error)
      const res = await addUser(createdBy, domain, data)
      return res
    }
    console.error('Error on update user to stat.swaponline:', error)
  }
}

export default {
  addUser,
  updateUser,
}
