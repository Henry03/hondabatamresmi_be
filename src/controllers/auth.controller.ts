import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client'
import { response } from '../utils/response';

export const register = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, username, password, verificationCode } = req.body;
        
        if(verificationCode !== process.env.VERIFICATION_CODE) {
            return response(res, false, 400, 'Invalid verification code');
        }

        const hashedPassword = await bcrypt.hash(password, 12);
    
        const isDuplicate = await prisma.user.findFirst({
            where: {
                username: username
            }
        })

        if(isDuplicate) {
            return response(res, false, 400, 'Username already taken');
        }

        await prisma.user.create({
            data: {
                name,
                username,
                password: hashedPassword
            }
        });

        return response(res, true, 201, 'User created successfully');
    } catch (err) {
        next(err);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;
        
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return response(res, false, 401, 'Invalid credentials');
        }
        const token = jwt.sign({ userId: user.id, name: user.name }, process.env.JWT_SECRET as string);
        const responseData = {
            token
        }

        return response(res, true, 200, 'Logged in successfully', responseData);
    } catch (err) {
        next(err);
    }
};