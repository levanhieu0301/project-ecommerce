import express, { Request, Response } from "express"
import path from "path"
const app = express()
const port = 5000
// Tích hợp giao diện pug
app.set('views', path.join(__dirname, "views"))
app.set('view engine', 'pug')
// Nhúng file tĩnh 
app.use(express.static(path.join(__dirname, 'public')));
// Router client
import clientRoute from "./routes/client/index.route"
app.use('/', clientRoute)
// Router admin
import adminRoute from "./routes/admin/index.route"
app.use('/admin', adminRoute)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})