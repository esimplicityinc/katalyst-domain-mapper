import { db } from '../db';
import { governance_snapshots } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';

async function main() {
    console.log('Testing DB connection...');
    try {
        const id = uuidv4();
        await db.insert(governance_snapshots).values({
            id,
            content: JSON.stringify({ test: 'data' }),
        });
        console.log('Insert successful:', id);

        const result = await db.select().from(governance_snapshots);
        console.log('Select successful, count:', result.length);
    } catch (err) {
        console.error('DB Operation failed:', err);
    }
}

main();
