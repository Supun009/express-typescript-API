import bcrypt from 'bcrypt';

export const hashPassword = async (password: string, salt: string) :Promise<string>  =>  bcrypt.hash(password, salt);

export const comparePassword = async (password: string, hashedPassword: string) : Promise<boolean> => 
    bcrypt.compare(password, hashedPassword).catch(() => false);
    
