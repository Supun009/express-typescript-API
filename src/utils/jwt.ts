import jwt from 'jsonwebtoken';


export const createToken = async (payload : object, secret: string) => {
    const token = await jwt.sign(payload, secret, {
        expiresIn: '1h'
    });
    return token
}