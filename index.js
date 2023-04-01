const {ApolloServer}= require('apollo-server')
require('dotenv').config({path: 'variables.env'}) 

const jwt = require('jsonwebtoken');

const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')

const conectarDB = require('./config/db')




//conectar a la base de datos

conectarDB();



const server = new ApolloServer({
    typeDefs,
    resolvers,
    
    context: ({req}) => {
        const token =  req.headers['authorization'] || ''
        if(token) {
            try {
                const usuario =  jwt.verify(token, process.env.PALABRATOKEN);
                return {
                    usuario
                }
            } catch (error) {
                console.log(error)            }
        }

      
    }
    
    });        

server.listen({port:process.env.PORT || 4000}).then(({url}) => {
    console.log(`Servicio Listo en la Url ${url}`)
})  