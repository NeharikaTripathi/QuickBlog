import express from "express";
import 'dotenv/config' ;//use environment variables
import cors from "cors";//allows to connect backend to frontend
import connectDB from "./configs/db.js";
import adminRouter from "./routes/adminRoutes.js";
import blogRouter from "./routes/blogRoutes.js";

const app = express();

await connectDB();

//  Middlewares
app.use(cors());
app.use(express.json());

//Home route
app.get('/',(req, res)=> res.send("API is Working"))

app.use('/api/admin', adminRouter)
app.use('/api/blog', blogRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> 
    {console.log('Server running on port' + PORT)})

export default app;

