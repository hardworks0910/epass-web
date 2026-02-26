import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request) {
    try {
        const body = await request.json();
        const { password } = body;

        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            console.error("ADMIN_PASSWORD environment variable is not set.");
            return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 });
        }

        if (password === adminPassword) {
            const sql = neon(process.env.DATABASE_URL);

            // Ensure table exists just in case
            await sql`
              CREATE TABLE IF NOT EXISTS records (
                  id SERIAL PRIMARY KEY,
                  timestamp BIGINT,
                  nama TEXT,
                  "noEpass" TEXT,
                  "tarikhLahir" TEXT,
                  warganegara TEXT,
                  jantina TEXT,
                  "nomborPassport" TEXT,
                  "jenisPas" TEXT
              );
            `;

            // Fetch records from Neon DB
            const records = await sql`SELECT * FROM records ORDER BY timestamp DESC`;

            return NextResponse.json({ success: true, records });
        } else {
            return NextResponse.json({ success: false, message: 'Invalid Admin Password' }, { status: 401 });
        }
    } catch (error) {
        console.error("Admin Verify Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
