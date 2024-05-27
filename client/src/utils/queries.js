import { gql } from '@apollo/client';

export const GET_LISTS_BY_ME = gql`
    query me {
        me {
            _id
            username
            email
            ownedLists {
                _id
                name
                owner
                description
            }
            memberedLists {
                _id
                name
                owner
                description
            }
        }
    }
`

export const GET_LISTS = gql`
    query getLists {
        lists {
            _id
            name
            description
            owner
        }
    }
`

// get a signle list
export const GET_LIST = gql`
    query getList($id: ID!) {
        list(listId: $id) {
            name
            owner
            updatedAt
            items {
                name
                description
                boughtBy
                addedBy
                _id
            }
            description
        }
    }
`

// get updatedAt of a list with listId
export const GET_LIST_UPDATED_AT = gql`
    query getListUpdatedAt($id: ID!) {
        list(listId: $id) {
            updatedAt
        }
    }
`

export const GET_LIST_VERSION = gql`
    query getListVersion($id: ID!) {
        list(id: $id) {
            _id
            version
        }
    }
`