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
          "jenisPas" TEXT,
          "deviceId" TEXT,
          "userAgent" TEXT
      );
    `;

        await sql`ALTER TABLE records ADD COLUMN IF NOT EXISTS "deviceId" TEXT`;
        await sql`ALTER TABLE records ADD COLUMN IF NOT EXISTS "userAgent" TEXT`;

        const rawUa = req.headers.get('user-agent') || '';
        const userAgent = rawUa.length > 2000 ? rawUa.slice(0, 2000) : rawUa;
        const rawId = typeof body.deviceId === 'string' ? body.deviceId.trim() : '';
        const deviceId = rawId.length > 128 ? rawId.slice(0, 128) : rawId;

        // Insert the new record
        await sql`
      INSERT INTO records (timestamp, nama, "noEpass", "tarikhLahir", warganegara, jantina, "nomborPassport", "jenisPas", "deviceId", "userAgent")
      VALUES (${body.timestamp}, ${body.nama}, ${body.noEpass}, ${body.tarikhLahir}, ${body.warganegara}, ${body.jantina}, ${body.nomborPassport}, ${body.jenisPas}, ${deviceId || null}, ${userAgent || null})
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DB Save Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
