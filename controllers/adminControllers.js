// imports admin collection for accessing it here in the callbacks (controllers)
const adminCollection = require('../models/adminModel');
const userCollection = require('../models/userModel');
const productCollection = require('../models/productModel');
const brandCollection = require('../models/brandModel');
const categoryCollection = require('../models/categoryModel');

const bcrypt = require('bcrypt');
const validator = require('validator');


const auth = (req, res, next) => {
    if (req.session.admin) {
        next();
    } else {
        res.redirect('/admin/login');
    }
}



// sets new admin into the database
const setAdmin = async (req, res) => {
    const check = await adminCollection.find({});

    if (check.length === 0) {
        const name = 'shijo';
        const email = 'shijo@gmail.com';
        const plainPassword = '1234'; // Predefined password

        // Hash the predefined password
        const hashedPassword = await bcrypt.hash(plainPassword, 10); // Using 10 salt rounds

        const data = {
            name: name,
            email: email,
            password: hashedPassword // Store the hashed password in the database
        };

        await new adminCollection(data).save();
        res.send('Admin set successfully...');
    } else {
        res.send("You don't have access to this page...");
    }
}

const getLogin = (req, res) => {
    try {
        if (req.session.notFound) {
            req.session.notFound = false;
            return res.render('./admin/adminLogin', { message: 'Admin not found, Try again!', class: 'alert-danger' })
        } else if (req.session.invalid) {
            req.session.invalid = false;
            return res.render('./admin/adminLogin', { message: 'Invalid admin credentials, Try again!', class: 'alert-danger' })
        } else if (req.session.admin) {
            res.redirect('/admin/dashboard');
        }
        else {
            res.render('./admin/adminLogin');
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');
    }
}

const postLogin = async (req, res) => {
    try {
        if (validator.isEmail(req.body.email)) {
            req.session.admin = await adminCollection.findOne({ email: req.body.email });
            if (!req.session.admin) {
                req.session.notFound = true;
                return res.redirect('/admin/login');
            }
            const passwordCheck = await bcrypt.compare(req.body.password, req.session.admin.password);

            if (passwordCheck) {
                return res.redirect('/admin/dashboard');
            } else {
                req.session.invalid = true;
                return res.redirect('/admin/login');
            }
        } else {
            return res.render('./admin/adminLogin', { message: 'Invalid email, Try again!', class: 'alert-danger' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');
    }
}

const getDashboard = (req, res) => {
    try {
        if (req.session.admin) {
            const admin = req.session.admin
            res.render('./admin/adminDashboard', { admin });
        } else {
            res.redirect('/admin/login')
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');
    }
}


const getLogout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.err('Error destroying session', err)
                res.status(500).render('./common/500');
            } else {
                res.redirect('/admin/login')
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}



// Categories
const getCategories = async (req, res) => {
    try {
        const admin = req.session.admin;
        const categories = await categoryCollection.find();
        if (req.session.categoryCreated) {
            req.session.categoryCreated = false;
            res.render('./admin/categories', { admin, message: 'category added successfully', class: 'alert-success', categories })
        } else if (req.session.categoryUpdated) {
            req.session.categoryUpdated = false;
            res.render('./admin/categories', { admin, message: 'category updated successfully', class: 'alert-success', categories })
        } else {
            res.render('./admin/categories', { admin, categories })
        }
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}

const getCreateCategory = (req, res) => {
    try {
        const admin = req.session.admin;
        res.render('./admin/createCategory', { admin })
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}

const postCreateCategory = async (req, res) => {
    try {
        // Extract form data
        if (req.file) {
            req.body.image = req.file.filename;
        }

        // Save the new category to the database
        await new categoryCollection(req.body).save();

        req.session.categoryCreated = true;
        res.redirect('/admin/categories');

    } catch (error) {
        console.error('Error creating category:', error);
        // Redirect to an error page or send an error response
        res.status(500).send('Internal Server Error');
    }
};

const getEditCategory = async (req, res) => {
    try {
        const admin = req.session.admin;
        const categoryId = req.params.categoryId;
        const category = await categoryCollection.findOne({ _id: categoryId })
        res.render('./admin/editCategory', { admin, category })
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}

const postEditCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const { name, description } = req.body;
        // Find the category by ID
        let category = await categoryCollection.findOne({ _id: categoryId });
        if (!category) {
            return res.status(404).render('./common/404');
        }
        // Update category fields
        category.name = name;
        category.description = description;
        category.updatedAt = Date.now();

        // Check if a new image file is uploaded
        if (req.file) {
            category.image = req.file.filename;
        }
        // Save the updated category
        // here we can use updateOne or findByIdAndUpdate method from mongoose
        await category.save();
        // OR await categoryCollection.updateOne({_id: categoryId},{$set: category});
        // OR await categoryCollection.findByIdAndUpdate(categoryId, category)
        req.session.categoryUpdated = true;
        res.redirect('/admin/categories'); // Redirect to the category list page after successful update
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).render('./common/500');
    }
};

const postDeleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const deletedCategory = await categoryCollection.findByIdAndDelete(categoryId); //returns the userID
        if (!deletedCategory) {
            return res.status(404).render('./common/404')
        }
        res.redirect('/admin/categories');

    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');

    }
}


// Brands

const getBrands = async (req, res) => {
    try {
        const admin = req.session.admin;
        const brands = await brandCollection.find();
        if (req.session.brandAdded) {
            req.session.brandAdded = false;
            res.render('./admin/brands', { admin, message: 'Brand added successfully', class: 'alert-success', brands })
        } else if (req.session.brandUpdated) {
            req.session.brandUpdated = false;
            res.render('./admin/brands', { admin, message: 'brand updated successfully', class: 'alert-success', brands })
        } else {
            res.render('./admin/brands', { admin, brands });
        }
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}

const getAddBrand = async (req, res) => {
    try {
        const categories = await categoryCollection.find();
        const admin = req.session.admin;
        res.render('./admin/addBrand', { admin, categories })
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}

const postAddBrand = async (req, res) => {
    try {
        // Extract form data
        if (req.file) {
            req.body.image = req.file.filename;
        }
        // Save the new brand to the database
        await new brandCollection(req.body).save();

        req.session.brandAdded = true;
        res.redirect('/admin/brands')
    } catch (error) {
        console.error('Error creating brand:', error);
        // Redirect to an error page or send an error response
        res.status(500).send('Internal Server Error');
    }
};




const getEditBrand = async (req, res) => {
    try {
        const admin = req.session.admin;
        const brandId = req.params.brandId;
        const brand = await brandCollection.findOne({ _id: brandId })
        res.render('./admin/editBrand', { admin, brand })
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}

const postEditBrand = async (req, res) => {
    try {
        const brandId = req.params.brandId;
        const { name, description } = req.body;
        // Find the brand by ID
        let brand = await brandCollection.findOne({ _id: brandId });
        if (!brand) {
            return res.status(404).render('./common/404');
        }
        // Update brand fields
        brand.name = name;
        brand.description = description;
        brand.updatedAt = Date.now();

        // Check if a new image file is uploaded
        if (req.file) {
            brand.image = req.file.filename;
        }
        // Save the updated brand
        // here we can use updateOne or findByIdAndUpdate method from mongoose
        await brand.save();
        // OR await brandCollection.updateOne({_id: brandId},{$set: brand});
        // OR await brandCollection.findByIdAndUpdate(brandId, brand)
        req.session.brandUpdated = true;
        res.redirect('/admin/brands'); // Redirect to the brand list page after successful update
    } catch (error) {
        console.error('Error updating brand:', error);
        res.status(500).render('./common/500');
    }
};

const postDeleteBrand = async (req, res) => {
    try {
        const brandId = req.params.brandId;
        const deletedBrand = await brandCollection.findByIdAndDelete(brandId);
        if (!deletedBrand) {
            return res.status(404).render('./common/404')
        }
        res.redirect('/admin/brands');

    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');

    }
}

// Products

const getProducts = async (req, res) => {
    try {
        const admin = req.session.admin;
        const products = await productCollection.find();
        if (req.session.productAdded) {
            req.session.productAdded = false;
            res.render('./admin/products', { admin, message: 'product added successfully', class: 'alert-success', products });
        } else if (req.session.productUpdated) {
            req.session.productUpdated = false;
            res.render('./admin/products', { admin, message: 'product updated successfully', class: 'alert-success', products });
        }
        else {
            res.render('./admin/products', { admin, products })
        }
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}
const getAddProduct = async (req, res) => {
    try {
        const admin = req.session.admin;
        const categories = await categoryCollection.find();
        const brands = await brandCollection.find();
        res.render('./admin/addProduct', { admin, categories, brands })
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}

const postAddProduct = async (req, res) => {
    try {
        // Extract main image and sub-images file paths from req.files
        const mainImageFileName = req.files['mainImage'][0].filename;
        const subImagesFileNames = req.files['subImages'].map(file => file.filename);

        // Create a new product object with data from the form
        const newProduct = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            brand: req.body.brand,
            mainImage: mainImageFileName,
            subImages: subImagesFileNames,
            stockQuantity: req.body.stockQuantity
        };

        const savedProduct = await new productCollection(newProduct).save();


        // updating the productId to the 'products' field of category collection 
        await categoryCollection.updateOne({ _id: req.body.category },{ $push: { products: savedProduct._id } });
        // OR
        // const category = await categoryCollection.findById(req.body.category);
        // category.products.push(savedProduct._id);
        // await category.save();

        // updating the productId to the 'products' field of brands collection
        await brandCollection.updateOne({_id: req.body.brand},{$push : {products: savedProduct._id}});

        req.session.productAdded = true;
        res.redirect('/admin/products')
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const getEditProduct = async (req, res) => {
    try {
        const admin = req.session.admin;
        const productId = req.params.productId;
        const product = await productCollection.findOne({ _id: productId })
        res.render('./admin/editProduct', { admin, product })
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}

const postEditProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const { name, description, price, stockQuantity } = req.body;
        // Find the product by ID
        let product = await productCollection.findOne({ _id: productId });
        if (!product) {
            return res.status(404).render('./common/404');
        }
        // Update product fields
        product.name = name;
        product.description = description;
        product.price = price;
        product.stockQuantity = stockQuantity
        product.updatedAt = Date.now();

        // Check if a new image file is uploaded
        // if (req.files) {
        //     product.mainImage = req.files['mainImage'][0].filename;
        //     product.subImages = req.files['subImages'].map(file => file.filename);
        // }

        // Check if a new image file is uploaded for the main image
        if (req.files && req.files['mainImage'] && req.files['mainImage'][0]) {
            product.mainImage = req.files['mainImage'][0].filename;
        }

        // Check if a new image file is uploaded for sub images
        if (req.files && req.files['subImages']) {
            product.subImages = req.files['subImages'].map(file => file.filename);
        }

        // Save the updated product
        // here we can use updateOne or findByIdAndUpdate method from mongoose
        await product.save();
        // OR await productCollection.updateOne({_id: productId},{$set: product});
        // OR await productCollection.findByIdAndUpdate(productId, product)
        req.session.productUpdated = true;
        res.redirect('/admin/products'); // Redirect to the product list page after successful update
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).render('./common/500');
    }
};

const postDeleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const deletedProduct = await productCollection.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return res.status(404).render('./common/404')
        }
        res.redirect('/admin/products');

    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');

    }
}



// Users

const getUsers = async (req, res) => {
    try {
        const users = await userCollection.find();
        const admin = req.session.admin;
        res.render('./admin/users', { admin, users });
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}


const postBlockUser = async (req, res) => {
    try {
        // Find the user by ID and update the blocked status
        await userCollection.findByIdAndUpdate(req.params.userId, { blocked: true });
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const postUnblockUser = async (req, res) => {
    try {
        // Find the user by ID and update the blocked status
        await userCollection.findByIdAndUpdate(req.params.userId, { blocked: false });
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};




module.exports = {
    auth,
    setAdmin,
    getLogin,
    postLogin,
    getDashboard,
    getLogout,

    getCategories,
    getCreateCategory,
    postCreateCategory,
    getEditCategory,
    postEditCategory,
    postDeleteCategory,

    getBrands,
    getAddBrand,
    postAddBrand,
    getEditBrand,
    postEditBrand,
    postDeleteBrand,

    getProducts,
    getAddProduct,
    postAddProduct,
    getEditProduct,
    postEditProduct,
    postDeleteProduct,

    getUsers,
    postBlockUser,
    postUnblockUser,


}