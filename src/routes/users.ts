
import crypto from 'crypto'
import { knex } from '../database'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function userRoutes(app: FastifyInstance) {

    app.post('/', async (req, res) => {

        const createUserBodySchema = z.object({
            nome: z.string(),
        })

        const { nome } = createUserBodySchema.parse(req.body);

        let id = req.cookies.id;

        if (!id) {
            id = crypto.randomUUID()

            res.cookie("id", id, {
                path: "/",
                maxAge: 60 * 60 * 24 * 7 // 7 dias em segundos
            })

        }

        const user = await knex("users").insert({
            id: crypto.randomUUID(),
            nome
        })

        return res.status(201).send(user);

    })

    app.get('/:id', async (req, res) => {

        const { id } = req.cookies

        const user = await knex("users").where("id", id).select();

        return res.status(200).send({
            user
        });

    })



}

