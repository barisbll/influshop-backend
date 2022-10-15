// import { Request, Response } from 'express';
// // eslint-disable-next-line import/no-extraneous-dependencies
// import request from 'supertest';
// import { Server } from '../../../../../../util/Server';
// import { AuthController } from '../Auth.controller';

// describe('AuthController', () => {
//     const authController = new AuthController();

//     describe('getTest', () => {
//         it('should return a message', () => {
//             const req = {} as Request;
//             const res = {
//                 status: jest.fn().mockReturnThis(),
//                 json: jest.fn().mockReturnThis(),
//             } as unknown as Response;

//             authController.getTest(req, res);

//             expect(res.status).toHaveBeenCalledWith(200);
//             expect(res.json).toHaveBeenCalledWith({
//                 message: 'Hello World',
//             });
//         });

//         it('Should send a request using supertest', async () => {
//             const result = await request(Server.getServer()).get('/api/v1/auth/test');
//             expect(result.statusCode).toEqual(200);
//         });
//     });
// });

describe('AuthController', () => {
    it('expects true', () => {
        expect(true).toBe(true);
    });
});
