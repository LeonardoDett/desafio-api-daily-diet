
import crypto from 'crypto'
import { knex } from '../database'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-existis';

export async function transactionsRoutes(app: FastifyInstance) {

    app.addHook('preHandler', (req) =>{
        console.log(`[${req.method}] ${req.url}`)
    })

    app.get('/summary', { preHandler: [checkSessionIdExists] },async (req, res) => {

        const { sessionId } = req.cookies

        const summary = await knex("transactions").where("session_id", sessionId).sum('amount', { as: 'amount' }).first();



        return res.status(200).send({
            summary
        });

    });

    app.get('/:id', { preHandler: [checkSessionIdExists] },async (req, res) => {

        const getTransactionParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getTransactionParamsSchema.parse(req.params);
        const { sessionId } = req.cookies

        const transaction = await knex("transactions").where({
            id,
            session_id: sessionId
        }).first();

        return res.status(200).send({
            transaction
        });

    });

    app.get('/', { preHandler: [checkSessionIdExists] }, async (req, res) => {

        const { sessionId } = req.cookies

        const transactions = await knex("transactions").where("session_id", sessionId).select();

        return res.status(200).send({
            transactions
        });

    });

    app.post('/', async (req, res) => {

        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(["credit", "debit"]),
        })

        const { title, amount, type } = createTransactionBodySchema.parse(req.body);

        let sessionId = req.cookies.sessionId;

        if (!sessionId) {
            sessionId = crypto.randomUUID()

            res.cookie("sessionId", sessionId, {
                path: "/",
                maxAge: 60 * 60 * 24 * 7 // 7 dias em segundos
            })

        }

        await knex("transactions").insert({
            id: crypto.randomUUID(),
            title,
            amount: type === "credit" ? amount : amount * -1,
            session_id: sessionId
        })

        return res.status(201).send();

    })

}