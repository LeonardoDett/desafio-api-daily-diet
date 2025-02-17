import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";

export async function checkSessionIdExists(req:FastifyRequest, res:FastifyReply) {

    const id = req.cookies.id

    if (!id) {
        return res.status(401).send({ error: "ID is required" });
    }

}