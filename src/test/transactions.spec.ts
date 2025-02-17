import { afterAll, beforeAll, it, describe } from 'vitest'
import request from 'supertest';
import { app } from '../app'

describe("transactions routes", () => {

    beforeAll(async () => {
        await app.ready();
    }, 10000) // Aumenta o timeout para 10 segundos
    
    afterAll(async () => {
        await app.close();
    }, 10000) // Aumenta o timeout para 10 segundos

    it('O usuário consegue criar uma nova transação', async () => {
        await request(app.server)
            .post("/transactions")
            .send({
                title: "New transaction",
                amount: 5000,
                type: "debit"
            })
            .expect(201)
    }, 10000)

    it('O usuário precisa conseguir listar as transações', async () => {
        const createTransactionResponse = await request(app.server)
            .post("/transactions")
            .send({
                title: "New transaction",
                amount: 5000,
                type: "debit"
            })

        const cookies = createTransactionResponse.get('Set-Cookie')

        console.log(cookies);
    }, 10000)
})