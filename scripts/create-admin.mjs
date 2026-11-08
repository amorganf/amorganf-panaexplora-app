import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
const {Pool}=pg;
const pool=new Pool({connectionString:process.env.DATABASE_URL});
const [name,username,email,password]=process.argv.slice(2);
if(!name||!username||!email||!password||password.length<10){console.error('Uso: node scripts/create-admin.mjs "Nombre" usuario correo contraseña (mínimo 10 caracteres)');process.exit(1)}
const hash=await bcrypt.hash(password,12);
try{await pool.query(`INSERT INTO users(name,username,email,password_hash,role) VALUES($1,$2,$3,$4,'SUPERADMIN')`,[name,username,email,hash]);console.log("Administrador creado.");}
catch(e){console.error("No se pudo crear:",e.message);process.exitCode=1}
finally{await pool.end()}