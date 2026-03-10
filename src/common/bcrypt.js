import bcrypt from 'bcrypt'
import env from '../config/env.js'
import logger from '../logs/logger.js'

export const encriptar = async (text) => {
    try{
        const saltRounds = Number(env.bcrypt_salt_rounds)
        
        return await bcrypt.hash(text, saltRounds)
    }catch(e){
        logger.error(e)
        throw new Error('Error al encriptar el texto')
    }
}

export const comparar = async (text, hash) => {
    try{
        return await bcrypt.compare(text, hash)
    }catch(e){
        logger.error(e)
        throw new Error('Error al encriptar el texto')
    }
}