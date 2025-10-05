import bcrypt from 'bcrypt';

export const hashToken = async (token: string) :Promise<string>  =>  bcrypt.hash(token, 10);

export const compareToken = async (token: string, hashedToken: string) : Promise<boolean> => 
    bcrypt.compare(token, hashedToken).catch(() => false);


