import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("meals", (table) => {
        table.uuid("mealId").primary();
        table.string("nome").notNullable();
        table.text("descricao").nullable();
        table.timestamp("dataHora").defaultTo(knex.fn.now());
        table.boolean("isOnDiet").notNullable();
        table.uuid("id").references("id").inTable("users").onDelete("CASCADE");
      });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("meals");
}

