
const Usuario = require('../models/Usuarios')
const Tarea = require('../models/Tareas')
const Proyecto = require('../models/Proyecto')
const bcryptjs = require( 'bcryptjs')
const jwt = require('jsonwebtoken');
require('dotenv').config({path: 'variables.env'}) 



// Crea y firma un jasonwebtoken

const crearToken = (usuario, secreta, expiresIn) => {
    const {id, email} = usuario
    console.log(usuario)
    return jwt.sign({id,email}, secreta, { expiresIn})
}   


const resolvers = {
    Query: {
        obtenerProyectos: async (_, {}, ctx) => {
            const proyectos =  await Proyecto.find({creador: ctx.usuario.id})

            return proyectos;
        },  obtenerTareas: async (_,{ input}, ctx) => {
            const tareas = await Tarea.find({creador: ctx.usuario.id}).where('proyecto').equals(input.proyecto)
            return tareas;
        }

    },
    Mutation:{
        crearUsuario: async (_, {input}, ctx) => {
                const {email, password} = input;
                const existeUsuario = await Usuario.findOne({email})
                if(existeUsuario) {
                    throw new Error('El ususario ya esta registrado');
                }
                try {
                    //Hashear Password

                    const salt = await bcryptjs.genSalt(10);
                    input.password = await bcryptjs.hash(password, salt)
                    console.log(input)
                    // registrar nuevo ususario
                    const NuevoUsuario = new Usuario(input);
                    console.log(NuevoUsuario)
                    NuevoUsuario.save()
                    return "usuario creado correctamente bb"
                } catch (error) {
                    console.log(error)
                }
        },
        autenticarUsuario: async (_, {input}, ctx) => {
            const {email, password} = input;

            //revisar si el usuario existe
            const existeUsuario = await Usuario.findOne({email})

            if(!existeUsuario) {
                throw new Error('El ususario no registrado');
            }
            
            //revisar si el password es correcto
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password)
            console.log(passwordCorrecto)

            if(!passwordCorrecto) {
                throw new Error('password Incorrecto');
            }

            return {
                token: crearToken(existeUsuario, process.env.PALABRATOKEN, '10hr')
            }
        },
        nuevoProyecto: async (_,{input}, ctx) => {
            console.log('desde relveres', ctx)


        
            try {
                const proyecto = new Proyecto (input)
            // Asociar al creador
                proyecto.creador = ctx.usuario.id
                //almacenarlo en DB.
                const resultado = await proyecto.save();

                return resultado
            } catch (error) {
                console.log(error)
            }
        },

        actualizarProyecto: async (_,{id, input}, ctx) => {
            // Revisar si el proyecto existe o no
            let proyecto = await Proyecto.findById(id)
            if(!proyecto) {
                throw new Error('Proyecto no encontrado');
            }

            console.log("desdeactualizart" ,ctx)

            // Revisar que si la persona que trata de editarlo , es el creador

            if(proyecto.creador.toString() !== ctx.usuario.id){
                throw new Error('No tienes las credenciales ');
            }

            proyecto = await Proyecto.findOneAndUpdate({_id: id}, input, {new: true})

            return proyecto 
         

            //Guardar el proyecto
        },


        eliminarProyecto : async (_,{id, input}, ctx) => {
            let proyecto = await Proyecto.findById(id)
            if(!proyecto) {
                throw new Error('Proyecto no encontrado');
            }

            console.log("desdeactualizart" ,ctx)

            // Revisar que si la persona que trata de editarlo , es el creador

            if(proyecto.creador.toString() !== ctx.usuario.id){
                throw new Error('No tienes las credenciales ');
            }

            //Eliminar Proyecto
             await Proyecto.findOneAndDelete({_id : id});

             return "proyecto Eliminado"
        },

/// resolvers para tareaaas

        nuevaTarea: async (_,{ input}, ctx) => {
            try {
                const tarea = new Tarea(input)
                tarea.creador = ctx.usuario.id;
                const resultado = await tarea.save()
                return resultado
            } catch (error) {
                console.log(error)
            }

            
        },

        actualizarTarea: async (_,{id,  input, estado}, ctx) => {
            //si la tarea existe o no
            let tarea = await Tarea.findById(id);
            

            
            if (!tarea){
                throw new Error('Proye tarea no encontrada');
            }
            // Si la persona que edita es o no 
            
            if(tarea.creador.toString() !== ctx.usuario.id){
                throw new Error('No tienes las credenciales ');
            }
            input.estado = estado

            tarea = await Tarea.findOneAndUpdate({_id:id}, input, {new:true})
            return tarea

            // Guardar y retornar la tarea
        },
        eliminarTarea: async (_,{id}, ctx) => {
              //si la tarea existe o no
              let tarea = await Tarea.findById(id);
            

            
              if (!tarea){
                  throw new Error('Proye tarea no encontrada');
              }
              // Si la persona que edita es o no 
              
              if(tarea.creador.toString() !== ctx.usuario.id){
                  throw new Error('No tienes las credenciales ');
              }

              await Tarea.findOneAndDelete({_id: id})
              return "tarea eliminada"
        }

      
    }
}

module.exports= resolvers;