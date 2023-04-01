const mongoose = require('mongoose');
require('dotenv').config({path: 'variables.env'})    

const uri = `mongodb+srv://Caleb17:Caleb17@cluster0.8rhwfgf.mongodb.net/?retryWrites=true&w=majority`
const conectarDB  =  async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
           
        });
        console.log('base de datos conectada')
    } catch (error) {
        console.log('hubo un error con la conexion de la base dedatos')
        console.log(error)
        process.exit(1) // detener la app
    }
}

module.exports = conectarDB


