const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
    Query: {
        me: async (parent, args, context ) => {
            if(User.context) {
                const userData = await (await User.findOne({ _id: context.user })).select('-__V -password');

                return userData
            }

            throw new AuthenticationError('Not logged in')
        }
    },

    Mutation: {
        addUser: async ( parent, args ) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user }
        }, 
        login: async (parent, {email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials')
            }

            const correctPw = await user.isCorrectPassword(password)

            if(!correctPw) {
                throw new AuthenticationError('Something went wrong')
            }

            const token = signToken(user);
            return {token, user}
        }
    }
}

module.exports = resolvers;