import express, { Request, Response } from "express"
import path from "path"
import { domainCDN, pathAdmin } from "./configs/variable.config"
import { connectDB } from "./configs/database.config"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import session from "express-session";
import passport from "passport";
import { loginGoogle } from './configs/googleOauth.config';

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


// Middleware tắt cache (áp dụng cho tất cả GET request)
app.use((req, res, next) => {
  if (req.method === 'GET') {
    // Tắt cache
    // - no-store: không lưu ở cache nào cả
    // - no-cache: luôn kiểm tra lại với server trước khi dùng cache
    // - must-revalidate: nếu cache hết hạn thì phải hỏi lại server
    // - private: chỉ cache trên trình duyệt cá nhân, không cho proxy/cache chung
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    // Để tương thích với trình duyệt / proxy cũ
    res.set('Pragma', 'no-cache');

    // Đặt thời gian hết hạn của response là ngay lập tức (nghĩa là trình duyệt không được dùng lại mà không hỏi server)
    res.set('Expires', '0');
  }
  next();
});
app.use(cookieParser())

app.locals.pathAdmin = pathAdmin

app.locals.domainCDN = domainCDN;
// Cho phép gửi JSON
app.use(express.json())

// Cấu hình session
app.use(session({
  secret: `${process.env.SESSION_SECRET}`,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

loginGoogle(passport);

// Router client
import clientRoute from "./routes/client/index.route"
app.use('/', clientRoute)
// Router admin
import adminRoute from "./routes/admin/index.route"
import { loginPost } from "./controllers/client/auth.controller"
app.use(`/${pathAdmin}`, adminRoute)



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})