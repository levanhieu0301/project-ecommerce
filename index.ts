import express, { Request, Response } from "express"
import path from "path"
import { pathAdmin } from "./configs/variable.config"
import { connectDB } from "./configs/database.config"
import dotenv from "dotenv"
const app = express()
const port = 5000
// Tích hợp giao diện pug
app.set('views', path.join(__dirname, "views"))
app.set('view engine', 'pug')
// Nhúng file tĩnh 
app.use(express.static(path.join(__dirname, 'public')));
// Load biến môi trường
dotenv.config();
// Kết nối database
connectDB();

app.locals.pathAdmin = pathAdmin


// Router client
import clientRoute from "./routes/client/index.route"
app.use('/', clientRoute)
// Router admin
import adminRoute from "./routes/admin/index.route"
app.use(`/${pathAdmin}`, adminRoute)



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})