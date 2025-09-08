import express  from 'express'
import authrouter from './src/routes/auth/userRoutes.js'
import productrouter from './src/routes/productRoutes/productRoutes.js'
import adminrouter from './src/routes/auth/adminRoutes.js'
import authAdminProductRoutes from './src/routes/auth/adminRoutesProduect.js'
const router = express.Router()

router.use("/auth", authrouter)
router.use("/products", productrouter)
router.use("/auth/admin/", adminrouter)
router.use("/auth/admin/protect",authAdminProductRoutes)
export default router