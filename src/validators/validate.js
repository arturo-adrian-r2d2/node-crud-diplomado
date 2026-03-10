function validate (schema, target = 'body'){
    return (req, res, next) => {
        const data = req[target];

        if(!data || Object.keys(data).length === 0){
            return res.status(400).json({
                msg:`El ${target} no puede estar vacio`
            })
        }

        const {error, value} = schema.validate (data, {
            abortEealy: false,
            stripUnknown: true,
        })

        if(error) {
            return res.status(400).json({
                message: `Error de validacion en ${target}`,
                errors: error.details.map((err) => err.message)
            })
        }
        req[target] = value
        next();
    }
}

export default validate 