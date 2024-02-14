const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/adminControllers');
const upload = require('../middlewares/fileUpload')


router.get('/setAdmin',adminControllers.setAdmin);
router.get('/login',adminControllers.getLogin);
router.post('/login',adminControllers.postLogin);
router.get('/dashboard',adminControllers.getDashboard);
router.get('/logout',adminControllers.getLogout);

router.get('/categories', adminControllers.auth, adminControllers.getCategories);
router.get('/create-category', adminControllers.auth, adminControllers.getCreateCategory);
router.post('/create-category',upload.single('image'), adminControllers.postCreateCategory);
router.get('/edit-category/:categoryId',adminControllers.auth, adminControllers.getEditCategory);
router.post('/edit-category/:categoryId', upload.single('image'), adminControllers.postEditCategory);
router.post('/delete-category/:categoryId', adminControllers.postDeleteCategory);

router.get('/brands', adminControllers.auth, adminControllers.getBrands);
router.get('/add-brand', adminControllers.auth, adminControllers.getAddBrand);
router.post('/add-brand',upload.single('image'), adminControllers.postAddBrand);
router.get('/edit-brand/:brandId',adminControllers.auth, adminControllers.getEditBrand);
router.post('/edit-brand/:brandId', upload.single('image'), adminControllers.postEditBrand);
router.post('/delete-brand/:brandId', adminControllers.postDeleteBrand);

router.get('/products', adminControllers.auth, adminControllers.getProducts);
router.get('/add-product', adminControllers.auth, adminControllers.getAddProduct);
router.post('/add-product', upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'subImages', maxCount: 4 }]), adminControllers.postAddProduct);
router.get('/edit-product/:productId',adminControllers.auth, adminControllers.getEditProduct);
router.post('/edit-product/:productId',upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'subImages', maxCount: 4 }]), adminControllers.postEditProduct);
router.post('/delete-product/:productId', adminControllers.postDeleteProduct);

router.get('/users', adminControllers.auth, adminControllers.getUsers);
router.post('/block-user/:userId', adminControllers.postBlockUser);
router.post('/unblock-user/:userId', adminControllers.postUnblockUser);


module.exports = router;
