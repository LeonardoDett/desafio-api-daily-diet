// eslint-disable-next-line
import { knex } from 'knex';

declare module 'knex/types/table' {
    export interface Tables {
        transactions: {
            id: string;
            title: string;
            amount: number;
            created_at: string;
            session_id?: string;
        };
    }
}
