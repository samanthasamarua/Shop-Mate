const { User, List } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');
const mongoose = require('mongoose');

const resolvers = {
    Query: {
        users: async () => {
            return await User.find().populate('ownedLists').populate('memberedLists');
        },

        user: async (parent, { username }) => {
            return await User.findOne({ username }).populate('ownedLists').populate('memberedLists');
        },

        listsByUser: async (parent, { username }) => {
            const data = await User.findOne({ username }).populate('ownedLists').populate('memberedLists');
            
            // console.log(lists);
            return data.ownedLists.concat(data.memberedLists);
        },

        listsOwnedByUser: async (parent, { username }) => {
            const lists = await User.findOne({ username }).populate('ownedLists');
            // console.log(lists.ownedLists);
            return lists.ownedLists;
        },

        listsMemberedByUser: async (parent, { username }) => {
            const lists = await User.findOne({ username }).populate('memberedLists');
            // console.log(lists);
            return lists.memberedLists;
        },

        lists: async () => {
            return await List.find();
        },

        list: async (parent, { listId }) => {
            return await List.findOne({_id: listId});
        },

        // query me: get information of the logged in user
        me: async (parent, args, context) => {
            // console.log("context", context.user);
            
            if (context.user) {
                const lists = await User.findOne({ _id: context.user._id }).populate('memberedLists');
                return lists;
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    },

    Mutation: {
        createUser: async (parent, { firstName, lastName, username, email, password}) => {
            const user = await User.create({ firstName, lastName, username, email, password});
            const token = signToken(user); 

            return {token, user};
        },
        login: async (parent, {email, password}) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('No user found with this email address');
              }        

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw AuthenticationError('Wrong Password');
              }
        
              const token = signToken(user);
        
              return { token, user };
        },
        addList: async (parent, { name, description }, context) => {

            if (context.user.username) { 

                const owner = context.user.username;
                const list = await List.create({name, description, owner});
                console.log(list);
                // update new list to user information
                if (!list) {
                    throw new Error("list failed to create");
                };
                const listId = new mongoose.mongo.ObjectId(list._id);
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { 
                        $addToSet: { 
                            ownedLists: listId,
                            memberedLists: listId 
                        }
                    },
                    { new: true }
                );

                console.log(updatedUser);

                if (!updatedUser) {
                    throw new Error("user not found");
                };
                return list; 
            }
            
        },

        deleteList: async (parent, { listId }, context) => {
            if (context.user.username) {
                // check if the user owns the list
                const list = await List.findOne({ _id: listId });
                if (list.owner !== context.user.username) {
                    throw new Error("you don't have permission to delete this list");
                }

                // delete the list
                const deletedList = await List.findOneAndDelete({ _id: listId });

                if (!deletedList) {
                    throw new Error("list not found");
                };

                // update user information
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { 
                        $pull: { 
                            ownedLists: listId,
                            memberedLists: listId 
                        }
                    },
                    { new: true }
                );
                return deletedList;
            };
        },

        // duplicateList: create a new list from information of a list, remove boughtBy of Items
        duplicateList: async (parent, { listId }, context) => {
            if (context.user.username) {
                const list = await List.findOne({ _id: listId });
                if (!list) {
                    throw new Error("list not found");
                };
                let { name, description, owner, items } = list;
                // remove boughtBy of Items
                items.map(item => item.boughtBy = null);
                // update owner
                owner = context.user.username;
                // update name
                name = `${name} - Copy`;
                // create new list
                const newList = await List.create({name, description, owner, items});
                // update user information
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { 
                        $addToSet: { 
                            ownedLists: newList._id,
                            memberedLists: newList._id 
                        }
                    },
                    { new: true }
                );
                return newList;
            };
        },
    // //     removeList: async (parent, { listId }) => {
    // //         return List.findOneAndDelete({ _id: listId });
    // //     },
    // //     editList: async (parent, { listId, name, description, members }) => {
    // //         const list =  List.findOneAndUpdate( 
    // //             listId,
    // //             { name, description, members },
    // //             { new: true }
    // //         );
    // //         if (!list) {
    // //             throw new Error("list not found.");
    // //         }; 
    // //         return list; 
    // //     },
    //     // addItemToList: async (parent, { listId, name, addedBy, description }) => {
    //     //     const newList = List.findByIdAndUpdate {
    //     //         listId, 
    //     //         { }
    //     //     }
    //     // },
    //     // removeItem: async (parent, { listId, itemId }) => {
    //     //     return Item.findOneAndDelete({ itemId })
    //     // },
    //     // editItem: async (parent, {listId, itemId, name, description }) => {
            
    //     // },

    },
};

module.exports = resolvers;