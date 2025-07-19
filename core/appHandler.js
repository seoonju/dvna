module.exports.userSearch = function (req, res) {
	var query = "SELECT name,id FROM Users WHERE login=:login";
	db.sequelize.query(query, {
		replacements: { login: req.body.login },
		model: db.User
	}).then(user => {
		if (user.length) {
			var output = {
				user: {
					name: user[0].name,
					id: user[0].id
				}
			}
			res.render('app/usersearch', {
				output: output
			})
		} else {
			req.flash('warning', 'User not found')
			res.render('app/usersearch', {
				output: null
			})
		}
	}).catch(err => {
		req.flash('danger', 'Internal Error')
		res.render('app/usersearch', {
			output: null
		})
	})
}

module.exports.redirect = function (req, res) {
	if (req.query.url && req.query.url.startsWith('/')) {
		res.redirect(req.query.url)
	} else {
		res.send('invalid redirect url')
	}
}

module.exports.bulkProductsLegacy = function (req,res){
	// TODO: Deprecate this soon
	if(req.files.products){
		var products = JSON.parse(req.files.products.data.toString('utf8'))
		products.forEach( function (product) {
			var newProduct = new db.Product()
			newProduct.name = product.name
			newProduct.code = product.code
			newProduct.tags = product.tags
			newProduct.description = product.description
			newProduct.save()
		})
		res.redirect('/app/products')
	}else{
		res.render('app/bulkproducts',{messages:{danger:'Invalid file'},legacy:true})
	}
}

module.exports.bulkProducts =  function(req, res) {
	if (req.files.products && req.files.products.mimetype=='text/xml'){
		var products = libxmljs.parseXmlString(req.files.products.data.toString('utf8'), {noent:false,noblanks:true})
		products.root().childNodes().forEach( product => {
			var newProduct = new db.Product()
			newProduct.name = product.childNodes()[0].text()
			newProduct.code = product.childNodes()[1].text()
			newProduct.tags = product.childNodes()[2].text()
			newProduct.description = product.childNodes()[3].text()
			newProduct.save()
		})
		res.redirect('/app/products')
	}else{
		res.render('app/bulkproducts',{messages:{danger:'Invalid file'},legacy:false})
	}
}