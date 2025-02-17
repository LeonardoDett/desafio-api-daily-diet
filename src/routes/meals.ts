
import crypto from 'crypto'
import { knex } from '../database'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-id-existis'

export async function mealsRoutes(app: FastifyInstance) {

    app.addHook('preHandler', checkSessionIdExists)

    app.post('/', async (req, res) => {

        const createMealBodySchema = z.object({
            nome: z.string(),
            descricao: z.string(),
            dataHora: z.date(),
            isOnDiet: z.boolean(),
        })

        const { nome, descricao, dataHora, isOnDiet } = createMealBodySchema.parse(req.body);

        const id = req.cookies.id;

        const meal = await knex("meals").insert({
            mealId: crypto.randomUUID(),
            nome,
            descricao,
            dataHora,
            isOnDiet,
            id
        })

        return res.status(201).send(meal);

    })

    app.get('/:mealId', async (req, res) => {

        const getMealParamsSchema = z.object({
            mealId: z.string().uuid(),
        })

        const { mealId } = getMealParamsSchema.parse(req.params);

        const { id } = req.cookies

        const meal = await knex("meals").where({
            id,
            mealId
        }).select();

        return res.status(200).send({
            meal
        });

    })

    app.get('/listAll', async (req, res) => {

        const { id } = req.cookies

        const meals = await knex("meals").where("id", id).select();

        return res.status(200).send({
            meals
        });

    })

    app.delete('/:mealId', async (req, res) => {

        const getMealParamsSchema = z.object({
            mealId: z.string().uuid(),
        })

        const { mealId } = getMealParamsSchema.parse(req.params);

        const { id } = req.cookies

        const meal = await knex("meals").where({
            id,
            mealId
        }).select();

        return res.status(200).send({
            meal
        });

    })

    app.patch('/:mealId', async (req, res) => {

        const updateMealBodySchema = z.object({
            nome: z.string().nullable(),
            descricao: z.string().nullable(),
            dataHora: z.date().nullable(),
            isOnDiet: z.boolean().nullable(),
        })
        const getMealParamsSchema = z.object({
            mealId: z.string().uuid(),
        })

        const { nome, descricao, dataHora, isOnDiet } = updateMealBodySchema.parse(req.body);
        const { mealId } = getMealParamsSchema.parse(req.params);

        const id = req.cookies.id;

        const meal = await knex("meals").update({
            nome,
            descricao,
            dataHora,
            isOnDiet,
            id
        }).where({
            id,
            mealId
        })

        return res.status(201).send(meal);

    })

    app.get('/summary', async (req, res) => {

        const { id } = req.cookies


        const totalMeals = await knex("meals").where("id", id).count({ count: "*" }).first();
        const mealsOnDiet = await knex("meals").where("id", id).andWhere("isOnDiet", true).count({ count: "*" }).first();
        const mealsOffDiet = await knex("meals").where("id", id).andWhere("isOnDiet", false).count({ count: "*" }).first();

        // Melhor sequência de refeições dentro da dieta
        const meals = await knex("meals").where("id", id).orderBy("dataHora", "asc");

        let maxSequence = 0;
        let currentSequence = 0;

        meals.forEach((meal) => {
            if (meal.isOnDiet) {
                currentSequence++;
                maxSequence = Math.max(maxSequence, currentSequence);
            } else {
                currentSequence = 0;
            }
        });

        return res.status(200).send({
            totalMeals: totalMeals?.count ?? 0,
            mealsOnDiet: mealsOnDiet?.count ?? 0,
            mealsOffDiet: mealsOffDiet?.count ?? 0,
            bestOnDietStreak: maxSequence,
        });

    })



}

