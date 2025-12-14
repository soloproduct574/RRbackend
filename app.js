import express  from 'express'
import authrouter from './src/routes/auth/userRoutes.js'
import productrouter from './src/routes/productRoutes/productRoutes.js'
import adminrouter from './src/routes/auth/adminRoutes.js'
import authAdminProductRoutes from './src/routes/auth/adminRoutesProduect.js'
import mediaHandler from "./src/routes/productRoutes/productMediaHandleRoutes.js"
import CategoriesAdd from "./src/routes/productRoutes/categoryRoutes.js"
import paymentRoutes from "./src/routes/paymentmodes/paymentRoutes.js"
import monUser from './src/routes/montizationRoutes/userRoutes.js'
import monauth from './src/routes/montizationRoutes/auth.js'
import monVideo from './src/routes/montizationRoutes/platformVideoRoutes.js'

const router = express.Router()

router.use("/auth", authrouter)
router.use("/products", productrouter)
router.use("/auth/admin/", adminrouter)
router.use("/auth/admin/protect",authAdminProductRoutes)
router.use("/media",mediaHandler)
router.use("/category",CategoriesAdd)
router.use("/payment",paymentRoutes)

router.use('/mon',monUser)
router.use('/mon',monauth)
router.use('/monvideo',monVideo)

export default router