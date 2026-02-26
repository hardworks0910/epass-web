import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const sql = neon(process.env.DATABASE_URL);

        // Initialize the table if it doesn't exist yet
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

        // Insert the new record
        await sql`
      INSERT INTO records (timestamp, nama, "noEpass", "tarikhLahir", warganegara, jantina, "nomborPassport", "jenisPas")
      VALUES (${body.timestamp}, ${body.nama}, ${body.noEpass}, ${body.tarikhLahir}, ${body.warganegara}, ${body.jantina}, ${body.nomborPassport}, ${body.jenisPas})
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DB Save Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
