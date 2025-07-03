import express from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());

// JWT Secret
const JWT_SECRET = 'agency_management_secret_key';

// Helper functions
const readDB = () => {
	return JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
};

const writeDB = (data) => {
	fs.writeFileSync('./db.json', JSON.stringify(data, null, 2), 'utf-8');
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		return res.status(401).json({
			code: 401,
			message: 'Access token required',
			status: 'error'
		});
	}

	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) {
			return res.status(403).json({
				code: 403,
				message: 'Invalid or expired token',
				status: 'error'
			});
		}
		req.user = user;
		next();
	});
};

// ============ AUTHENTICATION ENDPOINTS ============

// Login
app.post('/api/auth/login', async (req, res) => {
	const { personEmail, passwordHash } = req.body;
	const db = readDB();
	const users = db.users || [];

	// Find user by email
	const user = users.find(u => u.email === personEmail);
	if (!user) {
		return res.status(401).json({
			code: 401,
			message: 'Email không tồn tại',
			status: 'error'
		});
	}

	// Check password (simplified - in real app, use bcrypt compare)
	const isValidPassword = passwordHash === 'hello' || 
		passwordHash === '123456' || 
		user.passwordHash === passwordHash;

	if (!isValidPassword) {
		return res.status(401).json({
			code: 401,
			message: 'Mật khẩu không đúng',
			status: 'error'
		});
	}

	// Generate JWT token
	const token = jwt.sign(
		{ 
			id: user.id, 
			email: user.email, 
			role: user.role,
			fullName: user.fullName 
		},
		JWT_SECRET,
		{ expiresIn: '24h' }
	);

	const refreshToken = jwt.sign(
		{ id: user.id },
		JWT_SECRET,
		{ expiresIn: '7d' }
	);

	res.json({
		code: 200,
		status: 'success',
		message: 'Đăng nhập thành công',
		data: {
			accessToken: token,
			refreshToken: refreshToken,
			user: {
				id: user.id,
				email: user.email,
				fullName: user.fullName,
				role: user.role
			}
		}
	});
});

// Register
app.post('/api/auth/register', (req, res) => {
	const { personEmail, passwordHash, fullName, role } = req.body;
	const db = readDB();
	const users = db.users || [];

	// Check if user exists
	if (users.find(u => u.email === personEmail)) {
		return res.status(400).json({
			code: 400,
			message: 'Email đã tồn tại',
			status: 'error'
		});
	}

	// Create new user
	const newUser = {
		id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
		email: personEmail,
		passwordHash: passwordHash,
		fullName: fullName,
		role: role || 'VIEWER',
		createdAt: new Date().toISOString(),
		lastLogin: null,
		status: 'active'
	};

	users.push(newUser);
	db.users = users;
	writeDB(db);

	res.status(201).json({
		code: 201,
		status: 'success',
		message: 'Đăng ký thành công',
		data: {
			id: newUser.id,
			email: newUser.email,
			fullName: newUser.fullName,
			role: newUser.role
		}
	});
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
	const db = readDB();
	const users = db.users || [];
	const user = users.find(u => u.id === req.user.id);

	if (!user) {
		return res.status(404).json({
			code: 404,
			message: 'Người dùng không tồn tại',
			status: 'error'
		});
	}

	res.json({
		code: 200,
		status: 'success',
		data: {
			id: user.id,
			email: user.email,
			fullName: user.fullName,
			role: user.role,
			createdAt: user.createdAt,
			lastLogin: user.lastLogin
		}
	});
});

// Refresh token
app.post('/api/auth/refresh', (req, res) => {
	const { refreshToken } = req.body;

	if (!refreshToken) {
		return res.status(401).json({
			code: 401,
			message: 'Refresh token required',
			status: 'error'
		});
	}

	jwt.verify(refreshToken, JWT_SECRET, (err, user) => {
		if (err) {
			return res.status(403).json({
				code: 403,
				message: 'Invalid refresh token',
				status: 'error'
			});
		}

		const accessToken = jwt.sign(
			{ id: user.id },
			JWT_SECRET,
			{ expiresIn: '24h' }
		);

		res.json({
			code: 200,
			status: 'success',
			data: { accessToken }
		});
	});
});

// Logout
app.post('/api/auth/logout', (req, res) => {
	res.json({
		code: 200,
		status: 'success',
		message: 'Đăng xuất thành công'
	});
});

// ============ USER MANAGEMENT ENDPOINTS ============

// Get all users
app.get('/api/users', authenticateToken, (req, res) => {
	const db = readDB();
	const users = (db.users || []).map(user => ({
		id: user.id,
		email: user.email,
		fullName: user.fullName,
		role: user.role,
		createdAt: user.createdAt,
		lastLogin: user.lastLogin,
		status: user.status || 'active'
	}));

	res.json({
		code: 200,
		status: 'success',
		data: users,
		pagination: { total: users.length }
	});
});

// Create user
app.post('/api/users', authenticateToken, (req, res) => {
	const { email, password, fullName, role, username } = req.body;
	const db = readDB();
	const users = db.users || [];

	// Check if user exists
	if (users.find(u => u.email === email)) {
		return res.status(400).json({
			code: 400,
			message: 'Email đã tồn tại',
			status: 'error'
		});
	}

	const newUser = {
		id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
		email,
		passwordHash: password,
		fullName,
		role: role || 'VIEWER',
		username: username || email.split('@')[0],
		createdAt: new Date().toISOString(),
		lastLogin: null,
		status: 'active'
	};

	users.push(newUser);
	db.users = users;
	writeDB(db);

	res.status(201).json({
		code: 201,
		status: 'success',
		message: 'Tạo người dùng thành công',
		data: {
			id: newUser.id,
			email: newUser.email,
			fullName: newUser.fullName,
			role: newUser.role,
			username: newUser.username,
			createdAt: newUser.createdAt,
			status: newUser.status
		}
	});
});

// Update user
app.put('/api/users/:id', authenticateToken, (req, res) => {
	const userId = parseInt(req.params.id);
	const { email, fullName, role, status, username } = req.body;
	const db = readDB();
	const users = db.users || [];

	const userIndex = users.findIndex(u => u.id === userId);
	if (userIndex === -1) {
		return res.status(404).json({
			code: 404,
			message: 'Người dùng không tồn tại',
			status: 'error'
		});
	}

	// Check if email is taken by another user
	const emailTaken = users.find(u => u.email === email && u.id !== userId);
	if (emailTaken) {
		return res.status(400).json({
			code: 400,
			message: 'Email đã được sử dụng',
			status: 'error'
		});
	}

	users[userIndex] = {
		...users[userIndex],
		email: email || users[userIndex].email,
		fullName: fullName || users[userIndex].fullName,
		role: role || users[userIndex].role,
		status: status || users[userIndex].status,
		username: username || users[userIndex].username,
		updatedAt: new Date().toISOString()
	};

	db.users = users;
	writeDB(db);

	res.json({
		code: 200,
		status: 'success',
		message: 'Cập nhật người dùng thành công',
		data: {
			id: users[userIndex].id,
			email: users[userIndex].email,
			fullName: users[userIndex].fullName,
			role: users[userIndex].role,
			username: users[userIndex].username,
			status: users[userIndex].status
		}
	});
});

// Delete user
app.delete('/api/users/:id', authenticateToken, (req, res) => {
	const userId = parseInt(req.params.id);
	const db = readDB();
	const users = db.users || [];

	const userIndex = users.findIndex(u => u.id === userId);
	if (userIndex === -1) {
		return res.status(404).json({
			code: 404,
			message: 'Người dùng không tồn tại',
			status: 'error'
		});
	}

	users.splice(userIndex, 1);
	db.users = users;
	writeDB(db);

	res.json({
		code: 200,
		status: 'success',
		message: 'Xóa người dùng thành công'
	});
});

// ============ PRODUCT MANAGEMENT ENDPOINTS ============

// Get all products
app.get('/api/products', authenticateToken, (req, res) => {
	const db = readDB();
	const products = db.products || [];
	res.json({
		code: 200,
		status: 'success',
		data: products,
		pagination: { total: products.length }
	});
});

// Add a new product - UPDATED WITH AUTO EXPORT PRICE CALCULATION
app.post('/api/products', authenticateToken, (req, res) => {
	try {
		const db = readDB();
		const { productName, unitName, importPrice } = req.body;

		// Validate required fields (NEW FORMAT)
		if (!productName || !unitName || !importPrice) {
			return res.status(400).json({
				code: 400,
				message: 'Thiếu thông tin bắt buộc: productName, unitName, importPrice',
				status: 'error'
			});
		}

		// Validate import price
		const importPriceNum = parseFloat(importPrice);
		if (isNaN(importPriceNum) || importPriceNum <= 0) {
			return res.status(400).json({
				code: 400,
				message: 'Giá nhập phải là số dương',
				status: 'error'
			});
		}

		// Find unit by name (UPDATED TO SUPPORT unitName)
		const unitObject = db.units.find(u => 
			u.unitName === unitName || 
			u.name === unitName ||
			u.unitId === parseInt(unitName) || 
			u.id === parseInt(unitName)
		);
		
		if (!unitObject) {
			return res.status(400).json({
				code: 400,
				message: `Không tìm thấy đơn vị '${unitName}'`,
				status: 'error'
			});
		}

		// Get export_price_ratio from parameters
		const parameters = db.parameters || [];
		const exportRatioParam = parameters.find(p => p.param_key === 'export_price_ratio');
		const exportRatio = exportRatioParam ? parseFloat(exportRatioParam.param_value) : 1.02;

		// Calculate export price automatically
		const exportPrice = Math.round(importPriceNum * exportRatio);

		// Check if product name already exists
		const existingProduct = db.products.find(p => 
			(p.product_name || p.productName) === productName
		);
		if (existingProduct) {
			return res.status(400).json({
				code: 400,
				message: 'Tên sản phẩm đã tồn tại',
				status: 'error'
			});
		}

		// Create new product with calculated export price
		const newProduct = {
			productID: db.products.length > 0 ? Math.max(...db.products.map(p => p.productID || p.product_id || p.productId || 0)) + 1 : 1,
			productName: productName,
			unit: unitObject.unitName || unitObject.name,
			importPrice: importPriceNum,
			exportPrice: exportPrice,
			inventoryQuantity: 0
		};

		db.products.push(newProduct);
		writeDB(db);

		res.status(201).json({
			code: 201,
			status: 'success',
			message: `Thêm sản phẩm thành công. Giá xuất được tính tự động: ${exportPrice.toLocaleString('vi-VN')} VND (tỷ lệ: ${exportRatio})`,
			data: newProduct
		});
	} catch (error) {
		console.error('Error adding product:', error);
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống: ' + error.message
		});
	}
});

// Update a product
app.put('/api/products', authenticateToken, (req, res) => {
	const db = readDB();
	const { product_id, product_name, unit, import_price, export_price } = req.body;

	if (!product_id) {
		return res.status(400).json({
			code: 400,
			message: 'Product ID is required',
			status: 'error'
		});
	}

	const index = db.products.findIndex(p => (p.product_id || p.productID || p.productId) === parseInt(product_id));

	if (index === -1) {
		return res.status(404).json({
			code: 404,
			message: 'Product not found',
			status: 'error'
		});
	}

	let unitObject = db.products[index].unit;
	if (unit && unit !== unitObject.unitId && unit !== unitObject.id) {
		const foundUnit = db.units.find(u => u.unitId === parseInt(unit) || u.id === parseInt(unit));
		if (!foundUnit) {
			return res.status(400).json({
				code: 400,
				message: `Unit with ID '${unit}' not found`,
				status: 'error'
			});
		}
		unitObject = foundUnit;
	}

	const updatedProduct = {
		...db.products[index],
		product_name: product_name || db.products[index].product_name || db.products[index].productName,
		unit: unitObject,
		import_price: import_price ? parseFloat(import_price) : (db.products[index].import_price || db.products[index].importPrice),
		export_price: export_price ? parseFloat(export_price) : (db.products[index].export_price || db.products[index].exportPrice),
	};

	db.products[index] = updatedProduct;
	writeDB(db);

	res.json({
		code: 200,
		status: 'success',
		message: 'Product updated successfully',
		data: updatedProduct
	});
});

// Delete a product
app.delete('/api/products', authenticateToken, (req, res) => {
	const db = readDB();
	const { productId } = req.query;

	if (!productId) {
		return res.status(400).json({
			code: 400,
			message: 'Product ID is required',
			status: 'error'
		});
	}

	const id = parseInt(productId, 10);
	const initialLength = db.products.length;
	db.products = db.products.filter(p => (p.product_id || p.productID || p.productId) !== id);

	if (db.products.length === initialLength) {
		return res.status(404).json({
			code: 404,
			message: 'Product not found',
			status: 'error'
		});
	}

	writeDB(db);

	res.json({
		code: 200,
		status: 'success',
		message: 'Product deleted successfully'
	});
});

// ============ UNITS ENDPOINTS ============

// Get all units
app.get('/api/units', authenticateToken, (req, res) => {
	const db = readDB();
	const units = db.units || [];
	res.json({
		code: 200,
		data: units,
	});
});

// ============ AGENT MANAGEMENT ENDPOINTS ============

// Lấy danh sách đại lý
app.get('/api/agents', authenticateToken, (req, res) => {
	const db = readDB();
	res.json({
		code: 200,
		data: db.agents || [],
		message: 'Lấy danh sách đại lý thành công',
		status: 'success',
	});
});

// Thêm đại lý mới - RESTful endpoint
app.post('/api/agents', authenticateToken, async (req, res) => {
	try {
		const newAgent = req.body;
		const db = readDB();
		const agents = db.agents || [];
		const parameters = db.parameters || [];

		// Validate required fields
		if (!newAgent.agentName || !newAgent.districtId || !newAgent.agentTypeId) {
			return res.status(400).json({
				code: 400,
				status: 'error',
				message: 'Thiếu thông tin bắt buộc: tên đại lý, quận, loại đại lý',
				data: null
			});
		}

		// Lấy giới hạn số lượng đại lý tối đa theo quận từ parameters
		const maxAgentParam = parameters.find(p => p.param_key === 'max_agent_per_district');
		const maxAgentPerDistrict = maxAgentParam ? parseInt(maxAgentParam.param_value) : 5; // Default: 5

		// Đếm số lượng đại lý hiện tại trong quận
		const targetDistrictId = parseInt(newAgent.districtId);
		const agentsInDistrict = agents.filter(agent => {
			const agentDistrictId = agent.districtId || agent.district?.districtId || agent.districtID?.districtID;
			return parseInt(agentDistrictId) === targetDistrictId;
		});

		console.log(`Kiểm tra giới hạn đại lý cho quận ${targetDistrictId}: ${agentsInDistrict.length}/${maxAgentPerDistrict}`);

		// Kiểm tra ràng buộc số lượng đại lý tối đa
		if (agentsInDistrict.length >= maxAgentPerDistrict) {
			return res.status(400).json({
				code: 400,
				status: 'error',
				message: 'Số lượng đại lý trong quận đã đạt tối đa',
				data: null
			});
		}

		// Tạo ID mới cho đại lý
		newAgent.agentID = agents.length > 0 ? Math.max(...agents.map(a => a.agentID || a.agentId || 0)) + 1 : 1;
		newAgent.agentId = newAgent.agentID; // Đảm bảo tương thích

		// Thêm timestamps
		newAgent.createdAt = new Date().toISOString();
		newAgent.updatedAt = new Date().toISOString();

		// Thêm đại lý mới
		agents.push(newAgent);
		db.agents = agents;
		writeDB(db);

		res.status(201).json({
			code: 201,
			status: 'success',
			message: 'Thêm đại lý thành công',
			data: newAgent
		});

	} catch (error) {
		console.error('Lỗi khi thêm đại lý:', error);
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống khi thêm đại lý',
			data: null
		});
	}
});

// Cập nhật đại lý - RESTful endpoint
app.put('/api/agents/:id', authenticateToken, async (req, res) => {
	try {
		const agentId = parseInt(req.params.id);
		const updatedData = req.body;
		const db = readDB();
		const agents = db.agents || [];

		const agentIndex = agents.findIndex(a => (a.agentID || a.agentId) === agentId);
		if (agentIndex === -1) {
			return res.status(404).json({
				code: 404,
				status: 'error',
				message: 'Đại lý không tồn tại',
				data: null
			});
		}

		// Nếu thay đổi quận, kiểm tra giới hạn đại lý
		if (updatedData.districtId && updatedData.districtId !== agents[agentIndex].districtId) {
			const parameters = db.parameters || [];
			const maxAgentParam = parameters.find(p => p.param_key === 'max_agent_per_district');
			const maxAgentPerDistrict = maxAgentParam ? parseInt(maxAgentParam.param_value) : 5;

			const targetDistrictId = parseInt(updatedData.districtId);
			const agentsInNewDistrict = agents.filter(agent => {
				const agentDistrictId = agent.districtId || agent.district?.districtId || agent.districtID?.districtID;
				return parseInt(agentDistrictId) === targetDistrictId && (agent.agentID || agent.agentId) !== agentId;
			});

			if (agentsInNewDistrict.length >= maxAgentPerDistrict) {
				return res.status(400).json({
					code: 400,
					status: 'error',
					message: 'Số lượng đại lý trong quận đã đạt tối đa',
					data: null
				});
			}
		}

		// Cập nhật dữ liệu
		agents[agentIndex] = { 
			...agents[agentIndex], 
			...updatedData, 
			agentID: agentId, 
			agentId: agentId,
			updatedAt: new Date().toISOString()
		};
		
		db.agents = agents;
		writeDB(db);

		res.json({
			code: 200,
			status: 'success',
			message: 'Cập nhật đại lý thành công',
			data: agents[agentIndex]
		});
	} catch (error) {
		console.error('Lỗi khi cập nhật đại lý:', error);
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống khi cập nhật đại lý',
			data: null
		});
	}
});

// Xóa đại lý - RESTful endpoint
app.delete('/api/agents/:id', authenticateToken, async (req, res) => {
	try {
		const agentId = parseInt(req.params.id);
		const db = readDB();
		const agents = db.agents || [];

		const agentIndex = agents.findIndex(a => (a.agentID || a.agentId) === agentId);
		if (agentIndex === -1) {
			return res.status(404).json({
				code: 404,
				status: 'error',
				message: 'Đại lý không tồn tại',
				data: null
			});
		}

		// Xóa đại lý
		const deletedAgent = agents.splice(agentIndex, 1)[0];
		db.agents = agents;
		writeDB(db);

		res.json({
			code: 200,
			status: 'success',
			message: 'Xóa đại lý thành công',
			data: deletedAgent
		});
	} catch (error) {
		console.error('Lỗi khi xóa đại lý:', error);
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống khi xóa đại lý',
			data: null
		});
	}
});

// Lấy thông tin đại lý theo ID - RESTful endpoint
app.get('/api/agents/:id', authenticateToken, async (req, res) => {
	try {
		const agentId = parseInt(req.params.id);
		const db = readDB();
		const agents = db.agents || [];
		
		const agent = agents.find(a => (a.agentID || a.agentId) === agentId);
		if (!agent) {
			return res.status(404).json({
				code: 404,
				status: 'error',
				message: 'Đại lý không tồn tại',
				data: null
			});
		}

		res.json({
			code: 200,
			status: 'success',
			message: 'Lấy thông tin đại lý thành công',
			data: agent
		});
	} catch (error) {
		console.error('Lỗi khi lấy thông tin đại lý:', error);
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống khi lấy thông tin đại lý',
			data: null
		});
	}
});

// Thêm đại lý mới
app.post('/agent/addAgent', (req, res) => {
	const newAgent = req.body;
	const db = readDB();
	const agents = db.agents || [];

	newAgent.agentID =
		agents.length > 0 ? agents[agents.length - 1].agentID + 1 : 1;
	agents.push(newAgent);

	db.agents = agents;
	writeDB(db);

	res.status(201).json({
		code: 200,
		data: newAgent,
		message: 'Thêm đại lý thành công',
		status: 'success',
	});
});

// Cập nhật đại lý
app.put('/agent/updateAgent/:id', (req, res) => {
	const agentId = parseInt(req.params.id);
	const updatedData = req.body;
	const db = readDB();
	const agents = db.agents || [];

	const agentIndex = agents.findIndex(a => a.agentID === agentId);
	if (agentIndex === -1) {
		return res.status(404).json({
			code: 404,
			message: 'Đại lý không tồn tại',
			status: 'error'
		});
	}

	agents[agentIndex] = { ...agents[agentIndex], ...updatedData, agentID: agentId };
	db.agents = agents;
	writeDB(db);

	res.json({
		code: 200,
		data: agents[agentIndex],
		message: 'Cập nhật đại lý thành công',
		status: 'success'
	});
});

// Update agent debt
app.put('/agent/updateDebt', (req, res) => {
	const agent = req.body;
	const db = readDB();
	const agents = db.agents || [];
	const index = agents.findIndex((a) => a.agentID === agent.agentID);
	if (index !== -1) {
		agents[index].debtMoney = parseInt(agent.debtMoney);
		db.agents = agents;
		writeDB(db);
		res.json({
			code: 200,
			data: agents[index],
			message: 'Cập nhật nợ thành công',
			status: 'success',
		});
	} else {
		res.status(404).json({
			code: 404,
			message: 'Đại lý không tồn tại',
			status: 'error',
		});
	}
});

// Delete agent
app.delete('/agent/deleteAgent', (req, res) => {
	const agentID = parseInt(req.query.agentID);

	if (!agentID) {
		return res.status(400).json({
			code: 400,
			message: 'Thiếu agentID',
			status: 'fail',
		});
	}

	const db = readDB();
	const agents = db.agents || [];
	const index = agents.findIndex((a) => a.agentID === agentID);
	if (index !== -1) {
		agents.splice(index, 1);
		db.agents = agents;
		writeDB(db);
		res.json({
			code: 200,
			message: 'Xóa đại lý thành công',
			status: 'success',
		});
	} else {
		res.status(404).json({
			code: 404,
			message: 'Đại lý không tồn tại',
			status: 'error',
		});
	}
});

// Get agent by ID
app.get('/agent/getAgentById/:id', (req, res) => {
	const agentId = parseInt(req.params.id);
	const db = readDB();
	const agents = db.agents || [];
	
	const agent = agents.find(a => a.agentID === agentId);
	if (!agent) {
		return res.status(404).json({
			code: 404,
			message: 'Đại lý không tồn tại',
			status: 'error'
		});
	}

	res.json({
		code: 200,
		data: agent,
		message: 'Lấy thông tin đại lý thành công',
		status: 'success'
	});
});

// Get agent transactions
app.get('/agent/transactions/:id', (req, res) => {
	const agentId = parseInt(req.params.id);
	const db = readDB();
	
	// Mock transaction data
	const transactions = [
		{
			id: 1,
			type: 'export',
			date: '2024-01-15',
			amount: 2500000,
			description: 'Xuất hàng tháng 1'
		},
		{
			id: 2,
			type: 'payment',
			date: '2024-01-10',
			amount: -1000000,
			description: 'Thu tiền đợt 1'
		}
	].filter(t => agentId); // Filter by agentId in real implementation

	res.json({
		code: 200,
		data: transactions,
		message: 'Lấy lịch sử giao dịch thành công',
		status: 'success'
	});
});

// ============ PAYMENT RECEIPT ENDPOINTS ============

app.get('/paymentReceipt/getAllPaymentReceipts', (req, res) => {
	const db = readDB();
	const paymentReceipts = db.paymentReceipts || [];

	res.json({
		code: 200,
		data: paymentReceipts,
		message: 'Lấy danh sách phiếu thu tiền thành công',
		status: 'success',
	});
});

app.post('/paymentReceipt/addPaymentReceipt', (req, res) => {
	const db = readDB();
	const paymentReceipts = db.paymentReceipts || [];
	const agents = db.agents || [];

	const { agentID, paymentDate, revenue } = req.body;

	if (!agentID?.agentID || !paymentDate || revenue == null) {
		return res.status(400).json({
			code: 400,
			status: 'fail',
			message: 'Thiếu thông tin phiếu thu',
		});
	}

	const foundAgent = agents.find((a) => a.agentID === agentID.agentID);

	if (!foundAgent) {
		return res.status(404).json({
			code: 404,
			status: 'fail',
			message: 'Không tìm thấy đại lý',
		});
	}

	const newReceipt = {
		paymentReceiptID:
			paymentReceipts.length > 0
				? paymentReceipts[paymentReceipts.length - 1].paymentReceiptID + 1
				: 1,
		agentID: {
			agentID: foundAgent.agentID,
			agentName: foundAgent.agentName,
			address: foundAgent.address,
			phone: foundAgent.phone,
			email: foundAgent.email,
			paymentDate: paymentDate,
			revenue: revenue,
		},
	};

	paymentReceipts.push(newReceipt);
	db.paymentReceipts = paymentReceipts;
	writeDB(db);

	res.status(201).json({
		code: 201,
		status: 'success',
		message: 'Tạo phiếu thu tiền thành công',
		data: newReceipt,
	});
});

// ============ DEBT REPORT ENDPOINTS ============

app.get('/debtReport/getDebtReport', (req, res) => {
	const { month, year } = req.query;

	if (!month || !year) {
		return res.status(400).json({
			code: 400,
			data: [],
			message: 'Thiếu tháng hoặc năm',
			status: 'error',
		});
	}

	const db = readDB();
	const reports = db.debtReports || [];

	const filtered = reports.filter(
		(r) => r.month === parseInt(month) && r.year === parseInt(year)
	);

	return res.json({
		code: 200,
		data: filtered,
		message: 'Lấy báo cáo công nợ thành công',
		status: 'success',
	});
});

app.post('/debtReport/addDebtReport', (req, res) => {
	const { agentID, month, year } = req.body;
	const db = readDB();

	if (!agentID || !month || !year) {
		return res.status(400).json({
			code: 400,
			status: 'error',
			message: 'Thiếu thông tin cần thiết',
		});
	}

	const agents = db.agents || [];
	const agent = agents.find((a) => a.agentID === agentID);
	if (!agent) {
		return res.status(404).json({
			code: 404,
			status: 'error',
			message: 'Không tìm thấy đại lý',
		});
	}

	const debtReports = db.debtReports || [];
	const maxID = debtReports.reduce((max, r) => {
		const id = parseInt(r.debtReportID, 10);
		return id > max ? id : max;
	}, 0);
	const nextID = (maxID + 1).toString();

	const newDebtReport = {
		debtReportID: nextID,
		month,
		year,
		agentID: agent.agentID,
		agentName: agent.agentName,
		firstDebt: 1000000,
		arisenDebt: 500000,
		lastDebt: 1500000,
	};

	debtReports.push(newDebtReport);
	db.debtReports = debtReports;
	writeDB(db);

	res.status(201).json({
		code: 201,
		status: 'success',
		message: 'Tạo báo cáo công nợ thành công',
		data: newDebtReport,
	});
});

// ============ CATEGORIES ENDPOINTS ============

// Units
app.get('/api/units', (req, res) => {
	const db = readDB();
	res.json({
		code: 200,
		data: db.units || [],
		message: 'Lấy danh sách đơn vị thành công',
		status: 'success'
	});
});

app.post('/unit/add', (req, res) => {
	const { unitName, name } = req.body;
	const db = readDB();
	const units = db.units || [];

	const newUnit = {
		id: units.length > 0 ? Math.max(...units.map(u => u.id)) + 1 : 1,
		unitName: unitName || name,
		name: name || unitName
	};

	units.push(newUnit);
	db.units = units;
	writeDB(db);

	res.status(201).json({
		code: 201,
		data: newUnit,
		message: 'Thêm đơn vị thành công',
		status: 'success'
	});
});

app.put('/unit/update', (req, res) => {
	const { oldUnitName } = req.query;
	const { unitName } = req.body;
	const db = readDB();
	const units = db.units || [];

	const unitIndex = units.findIndex(u => u.unitName === oldUnitName);
	if (unitIndex === -1) {
		return res.status(404).json({
			code: 404,
			message: 'Đơn vị không tồn tại',
			status: 'error'
		});
	}

	units[unitIndex].unitName = unitName;
	units[unitIndex].name = unitName;
	db.units = units;
	writeDB(db);

	res.json({
		code: 200,
		data: units[unitIndex],
		message: 'Cập nhật đơn vị thành công',
		status: 'success'
	});
});

app.delete('/unit/delete', (req, res) => {
	const { unitName } = req.query;
	const db = readDB();
	const units = db.units || [];

	const unitIndex = units.findIndex(u => u.unitName === unitName);
	if (unitIndex === -1) {
		return res.status(404).json({
			code: 404,
			message: 'Đơn vị không tồn tại',
			status: 'error'
		});
	}

	units.splice(unitIndex, 1);
	db.units = units;
	writeDB(db);

	res.json({
		code: 200,
		message: 'Xóa đơn vị thành công',
		status: 'success'
	});
});

// Districts - Updated to match Spring Boot backend
app.get('/district/all', authenticateToken, (req, res) => {
	const db = readDB();
	res.json({
		code: 200,
		data: db.districts || [],
		message: 'Lấy danh sách quận/huyện thành công',
		status: 'success'
	});
});

app.post('/district/add', authenticateToken, (req, res) => {
	const { districtName, description } = req.body;
	
	if (!districtName || !districtName.trim()) {
		return res.status(400).json({
			code: 400,
			message: 'Tên quận không được để trống',
			status: 'error'
		});
	}
	
	const db = readDB();
	const districts = db.districts || [];

	// Check for duplicate name
	const existingDistrict = districts.find(d => 
		d.districtName.toLowerCase().trim() === districtName.toLowerCase().trim()
	);
	
	if (existingDistrict) {
		return res.status(400).json({
			code: 400,
			message: 'Tên quận đã tồn tại',
			status: 'error'
		});
	}

	const newDistrict = {
		districtId: districts.length > 0 ? Math.max(...districts.map(d => d.districtId || d.id || 0)) + 1 : 1,
		districtName: districtName.trim(),
		description: description || null
	};

	districts.push(newDistrict);
	db.districts = districts;
	writeDB(db);

	res.status(201).json({
		code: 201,
		data: newDistrict,
		message: 'Thêm quận thành công!',
		status: 'success'
	});
});

app.put('/district/update', authenticateToken, (req, res) => {
	const { oldDistrictName } = req.query;
	const { districtName, description } = req.body;
	
	if (!oldDistrictName || !oldDistrictName.trim()) {
		return res.status(400).json({
			code: 400,
			message: 'Thiếu tên quận cũ',
			status: 'error'
		});
	}
	
	if (!districtName || !districtName.trim()) {
		return res.status(400).json({
			code: 400,
			message: 'Tên quận mới không được để trống',
			status: 'error'
		});
	}
	
	const db = readDB();
	const districts = db.districts || [];

	const districtIndex = districts.findIndex(d => d.districtName === oldDistrictName);
	if (districtIndex === -1) {
		return res.status(404).json({
			code: 404,
			message: 'Quận không tồn tại',
			status: 'error'
		});
	}

	// Check for duplicate name (excluding current record)
	const existingDistrict = districts.find((d, index) => 
		index !== districtIndex && 
		d.districtName.toLowerCase().trim() === districtName.toLowerCase().trim()
	);
	
	if (existingDistrict) {
		return res.status(400).json({
			code: 400,
			message: 'Tên quận đã tồn tại',
			status: 'error'
		});
	}

	districts[districtIndex].districtName = districtName.trim();
	districts[districtIndex].description = description || null;
	db.districts = districts;
	writeDB(db);

	res.json({
		code: 200,
		data: districts[districtIndex],
		message: 'Cập nhật quận thành công',
		status: 'success'
	});
});

app.delete('/district/delete', authenticateToken, (req, res) => {
	const { districtName } = req.query;
	
	if (!districtName || !districtName.trim()) {
		return res.status(400).json({
			code: 400,
			message: 'Thiếu tên quận',
			status: 'error'
		});
	}
	
	const db = readDB();
	const districts = db.districts || [];

	const districtIndex = districts.findIndex(d => d.districtName === districtName);
	if (districtIndex === -1) {
		return res.status(404).json({
			code: 404,
			message: 'Quận không tồn tại',
			status: 'error'
		});
	}

	// Check if district has agents (mimic Spring Boot validation)
	const agents = db.agents || [];
	const hasAgents = agents.some(agent => {
		const agentDistrictName = agent.district?.districtName || agent.districtName;
		return agentDistrictName === districtName;
	});

	if (hasAgents) {
		return res.status(400).json({
			code: 400,
			message: 'Không thể xóa quận đã có đại lý',
			status: 'error'
		});
	}

	districts.splice(districtIndex, 1);
	db.districts = districts;
	writeDB(db);

	res.json({
		code: 200,
		message: 'Xóa quận thành công',
		status: 'success'
	});
});

// Agent Types
app.get('/api/agent-types', (req, res) => {
	const db = readDB();
	res.json({
		code: 200,
		data: db.agentTypes || [],
		message: 'Lấy danh sách loại đại lý thành công',
		status: 'success'
	});
});



app.put('/api/agent-types/:id', (req, res) => {
	const agentTypeId = parseInt(req.params.id);
	const { agentTypeName, maxDebt } = req.body;
	const db = readDB();
	const agentTypes = db.agentTypes || [];

	const agentTypeIndex = agentTypes.findIndex(at => at.id === agentTypeId);
	if (agentTypeIndex === -1) {
		return res.status(404).json({
			code: 404,
			message: 'Loại đại lý không tồn tại',
			status: 'error'
		});
	}

	agentTypes[agentTypeIndex].agentTypeName = agentTypeName;
	agentTypes[agentTypeIndex].maxDebt = maxDebt;
	db.agentTypes = agentTypes;
	writeDB(db);

	res.json({
		code: 200,
		data: agentTypes[agentTypeIndex],
		message: 'Cập nhật loại đại lý thành công',
		status: 'success'
	});
});

app.delete('/api/agent-types/:id', (req, res) => {
	const agentTypeId = parseInt(req.params.id);
	const db = readDB();
	const agentTypes = db.agentTypes || [];

	const agentTypeIndex = agentTypes.findIndex(at => at.id === agentTypeId);
	if (agentTypeIndex === -1) {
		return res.status(404).json({
			code: 404,
			message: 'Loại đại lý không tồn tại',
			status: 'error'
		});
	}

	agentTypes.splice(agentTypeIndex, 1);
	db.agentTypes = agentTypes;
	writeDB(db);

	res.json({
		code: 200,
		message: 'Xóa loại đại lý thành công',
		status: 'success'
	});
});

// Update maximum debt for agent type
app.put('/agent/updateAgentTypeMaxDebt', (req, res) => {
	const { agentTypeID, maximumDebt } = req.body;

	if (!agentTypeID || maximumDebt == null) {
		return res.status(400).json({
			code: 400,
			message: 'Thiếu thông tin agentTypeID hoặc maximumDebt',
			status: 'fail',
		});
	}

	const db = readDB();
	const agents = db.agents || [];
	let updated = false;

	agents.forEach(agent => {
		if (agent.agentTypeID && agent.agentTypeID.agentTypeID === agentTypeID) {
			agent.agentTypeID.maximumDebt = maximumDebt;
			updated = true;
		}
	});

	if (updated) {
		db.agents = agents;
		writeDB(db);
		res.json({
			code: 200,
			message: 'Cập nhật nợ tối đa cho loại đại lý thành công',
			status: 'success',
		});
	} else {
		res.status(404).json({
			code: 404,
			message: 'Không tìm thấy loại đại lý',
			status: 'error',
		});
	}
});

// ============ AGENT TYPE ENDPOINTS ============

// GET /agent-type/all - Lấy tất cả loại đại lý
app.get('/agent-type/all', authenticateToken, (req, res) => {
	const db = readDB();
	res.json({
		code: 200,
		data: db.agentTypes || [],
		message: 'Lấy danh sách loại đại lý thành công',
		status: 'success'
	});
});

// POST /agent-type/add - Thêm loại đại lý mới
app.post('/agent-type/add', authenticateToken, (req, res) => {
	const { agentTypeName, maximumDebt } = req.body;
	
	// Validation
	if (!agentTypeName || !agentTypeName.trim()) {
		return res.status(400).json({
			code: 400,
			message: 'Tên loại đại lý không được để trống',
			status: 'error'
		});
	}
	
	if (!maximumDebt || maximumDebt <= 0) {
		return res.status(400).json({
			code: 400,
			message: 'Số tiền nợ tối đa phải là số dương',
			status: 'error'
		});
	}
	
	const db = readDB();
	const agentTypes = db.agentTypes || [];
	
	// Check for duplicate name
	const existingType = agentTypes.find(type => 
		type.agentTypeName.toLowerCase().trim() === agentTypeName.toLowerCase().trim()
	);
	
	if (existingType) {
		return res.status(400).json({
			code: 400,
			message: 'Tên loại đại lý đã tồn tại',
			status: 'error'
		});
	}

	const newAgentType = {
		agentTypeId: agentTypes.length > 0 ? Math.max(...agentTypes.map(at => at.agentTypeId || at.id || 0)) + 1 : 1,
		agentTypeName: agentTypeName.trim(),
		maximumDebt: parseInt(maximumDebt)
	};

	agentTypes.push(newAgentType);
	db.agentTypes = agentTypes;
	writeDB(db);

	res.status(201).json({
		code: 201,
		data: newAgentType,
		message: 'Thêm loại đại lý thành công',
		status: 'success'
	});
});

// PUT /agent-type/update - Cập nhật loại đại lý
app.put('/agent-type/update', authenticateToken, (req, res) => {
	const { agentTypeID, agentTypeName, maximumDebt } = req.body;
	
	if (!agentTypeID) {
		return res.status(400).json({
			code: 400,
			message: 'Thiếu ID loại đại lý',
			status: 'error'
		});
	}
	
	if (!agentTypeName || !agentTypeName.trim()) {
		return res.status(400).json({
			code: 400,
			message: 'Tên loại đại lý không được để trống',
			status: 'error'
		});
	}
	
	if (!maximumDebt || maximumDebt <= 0) {
		return res.status(400).json({
			code: 400,
			message: 'Số tiền nợ tối đa phải là số dương',
			status: 'error'
		});
	}
	
	const db = readDB();
	const agentTypes = db.agentTypes || [];

	const agentTypeIndex = agentTypes.findIndex(at => 
		(at.agentTypeId || at.id) === parseInt(agentTypeID)
	);
	
	if (agentTypeIndex === -1) {
		return res.status(404).json({
			code: 404,
			message: 'Loại đại lý không tồn tại',
			status: 'error'
		});
	}
	
	// Check for duplicate name (excluding current record)
	const existingType = agentTypes.find((type, index) => 
		index !== agentTypeIndex && 
		type.agentTypeName.toLowerCase().trim() === agentTypeName.toLowerCase().trim()
	);
	
	if (existingType) {
		return res.status(400).json({
			code: 400,
			message: 'Tên loại đại lý đã tồn tại',
			status: 'error'
		});
	}

	agentTypes[agentTypeIndex].agentTypeName = agentTypeName.trim();
	agentTypes[agentTypeIndex].maximumDebt = parseInt(maximumDebt);
	db.agentTypes = agentTypes;
	writeDB(db);

	res.json({
		code: 200,
		data: agentTypes[agentTypeIndex],
		message: 'Cập nhật loại đại lý thành công',
		status: 'success'
	});
});

// DELETE /agent-type/delete - Xóa loại đại lý
app.delete('/agent-type/delete', authenticateToken, (req, res) => {
	const agentTypeId = parseInt(req.query.agentTypeId);
	
	if (!agentTypeId) {
		return res.status(400).json({
			code: 400,
			message: 'Thiếu ID loại đại lý',
			status: 'error'
		});
	}
	
	const db = readDB();
	const agentTypes = db.agentTypes || [];

	const agentTypeIndex = agentTypes.findIndex(at => 
		(at.agentTypeId || at.id) === agentTypeId
	);
	
	if (agentTypeIndex === -1) {
		return res.status(404).json({
			code: 404,
			message: 'Loại đại lý không tồn tại',
			status: 'error'
		});
	}

	agentTypes.splice(agentTypeIndex, 1);
	db.agentTypes = agentTypes;
	writeDB(db);

	res.json({
		code: 200,
		message: 'Xóa loại đại lý thành công',
		status: 'success'
	});
});

// ============ EXPORT RECEIPTS ENDPOINTS ============

// GET /api/export-receipts - Lấy tất cả phiếu xuất
app.get('/api/export-receipts', authenticateToken, (req, res) => {
	try {
		const db = readDB();
		const exportReceipts = db.exportReceipts || [];
		
		res.json({
			code: 200,
			status: 'success',
			message: 'Lấy danh sách phiếu xuất thành công',
			data: exportReceipts
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống'
		});
	}
});

// GET /api/export-receipts/{id} - Lấy phiếu xuất theo ID
app.get('/api/export-receipts/:id', authenticateToken, (req, res) => {
	try {
		const exportReceiptId = parseInt(req.params.id);
		const db = readDB();
		const exportReceipts = db.exportReceipts || [];
		
		const exportReceipt = exportReceipts.find(r => r.exportReceiptID === exportReceiptId);
		
		if (!exportReceipt) {
			return res.status(404).json({
				code: 404,
				status: 'error',
				message: 'Không tìm thấy phiếu xuất'
			});
		}
		
		res.json({
			code: 200,
			status: 'success',
			message: 'Lấy phiếu xuất thành công',
			data: exportReceipt
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống'
		});
	}
});

// GET /api/export-receipts/by-agent/{agentId} - Lấy phiếu xuất theo đại lý
app.get('/api/export-receipts/by-agent/:agentId', authenticateToken, (req, res) => {
	try {
		const agentId = parseInt(req.params.agentId);
		const db = readDB();
		const exportReceipts = db.exportReceipts || [];
		
		const agentReceipts = exportReceipts.filter(r => r.agent.agentID === agentId);
		
		res.json({
			code: 200,
			status: 'success',
			message: 'Lấy phiếu xuất theo đại lý thành công',
			data: agentReceipts
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống'
		});
	}
});

// POST /api/export-receipts/multiple - Tạo phiếu xuất mới với nhiều sản phẩm
app.post('/api/export-receipts/multiple', authenticateToken, (req, res) => {
	try {
		console.log('📥 Export Receipt Multiple API - Request body:', req.body);
		const { createDate, agentId, paidAmount, exportDetails } = req.body;
		const db = readDB();
		const exportReceipts = db.exportReceipts || [];
		const agents = db.agents || [];
		const products = db.products || [];
		
		console.log('🔍 Available agents:', agents.map(a => ({ id: a.agentID, name: a.agentName })));
		console.log('🔍 Available products:', products.map(p => ({ id: p.productID, name: p.productName })));
		
		// Validate required fields
		if (!createDate || !agentId || !Array.isArray(exportDetails) || exportDetails.length === 0) {
			return res.status(400).json({
				code: 400,
				status: 'error',
				message: 'Thiếu thông tin bắt buộc: createDate, agentId, exportDetails'
			});
		}
		
		// Tìm đại lý
		const agent = agents.find(a => a.agentID === parseInt(agentId));
		console.log('🔍 Found agent:', agent);
		if (!agent) {
			console.log('❌ Agent not found with ID:', agentId);
			return res.status(404).json({
				code: 404,
				status: 'error',
				message: 'Không tìm thấy đại lý'
			});
		}
		
		// Validate và tính tổng tiền từ exportDetails
		let totalAmount = 0;
		const validatedDetails = [];
		
		for (const detail of exportDetails) {
			const { productID, quantityExport } = detail;
			
			if (!productID || !quantityExport || quantityExport <= 0) {
				return res.status(400).json({
					code: 400,
					status: 'error',
					message: 'Chi tiết sản phẩm không hợp lệ'
				});
			}
			
			const product = products.find(p => p.productID === parseInt(productID));
			if (!product) {
				return res.status(404).json({
					code: 404,
					status: 'error',
					message: `Không tìm thấy sản phẩm với ID: ${productID}`
				});
			}
			
			const itemTotal = (product.exportPrice || product.export_price || 0) * parseInt(quantityExport);
			totalAmount += itemTotal;
			
			validatedDetails.push({
				productID: parseInt(productID),
				product: product,
				quantityExport: parseInt(quantityExport),
				unitPrice: product.exportPrice || product.export_price || 0,
				totalPrice: itemTotal
			});
		}
		
		console.log('💰 Calculated total amount:', totalAmount);
		console.log('📦 Validated details:', validatedDetails);
		
		// Tạo phiếu xuất mới
		const newExportReceiptId = exportReceipts.length > 0 ? Math.max(...exportReceipts.map(r => r.exportReceiptID)) + 1 : 1;
		const finalPaidAmount = parseFloat(paidAmount) || 0;
		const remainingAmount = totalAmount - finalPaidAmount;
		
		const newExportReceipt = {
			exportReceiptId: newExportReceiptId,
			agent: {
				agentId: agent.agentID,
				agentName: agent.agentName,
				agentType: agent.agentType || { agentTypeId: 1, agentTypeName: "Loại 1", maximumDebt: 10000000 },
				phone: agent.phone || agent.phoneNumber || "0123456789",
				email: agent.email || "kb@gmail.com",
				address: agent.address || "Không biết",
				district: agent.district || { districtId: 1, districtName: "Quận 1" },
				receptionDate: agent.receptionDate || "2025-06-20",
				debtMoney: agent.debtMoney || remainingAmount
			},
			createDate: createDate,
			totalAmount: totalAmount,
			paidAmount: finalPaidAmount,
			remainingAmount: remainingAmount
		};
		
		exportReceipts.push(newExportReceipt);
		
		// Tạo export details
		const allExportDetails = db.exportDetails || [];
		for (const detail of validatedDetails) {
			const newExportDetail = {
				exportDetailID: allExportDetails.length > 0 ? Math.max(...allExportDetails.map(d => d.exportDetailID)) + 1 : 1,
				exportReceiptID: newExportReceiptId,
				productID: detail.productID,
				productName: detail.product.productName,
				quantity: detail.quantityExport,
				unitPrice: detail.unitPrice,
				totalPrice: detail.totalPrice
			};
			
			allExportDetails.push(newExportDetail);
		}
		
		// Update agent debt
		const agentIndex = agents.findIndex(a => a.agentID === agent.agentID);
		if (agentIndex !== -1) {
			agents[agentIndex].debtMoney = (agents[agentIndex].debtMoney || 0) + remainingAmount;
		}
		
		// Save to database
		db.exportReceipts = exportReceipts;
		db.exportDetails = allExportDetails;
		db.agents = agents;
		writeDB(db);
		
		res.status(201).json({
			code: 201,
			status: 'success',
			message: 'Tạo phiếu xuất hàng với nhiều mặt hàng thành công',
			data: newExportReceipt
		});
	} catch (error) {
		console.error('❌ Error in export-receipts/multiple POST:', error);
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống: ' + error.message
		});
	}
});

// POST /api/export-receipts - Tạo phiếu xuất mới (single product - legacy)
app.post('/api/export-receipts', authenticateToken, (req, res) => {
	try {
		console.log('📥 Export Receipt API - Request body:', req.body);
		const { createDate, agentId, productID, unitID, quantityExport, paidAmount, agentID, totalAmount, exportDetails } = req.body;
		
		// Nếu có exportDetails, chuyển hướng đến endpoint multiple
		if (exportDetails && Array.isArray(exportDetails) && exportDetails.length > 0) {
			console.log('🔄 Redirecting to multiple endpoint...');
			return app._router.handle({ 
				...req, 
				url: '/api/export-receipts/multiple',
				originalUrl: '/api/export-receipts/multiple'
			}, res);
		}
		const db = readDB();
		const exportReceipts = db.exportReceipts || [];
		const agents = db.agents || [];
		const products = db.products || [];
		
		console.log('🔍 Available agents:', agents.map(a => ({ id: a.agentID, name: a.agentName })));
		console.log('🔍 Available products:', products.map(p => ({ id: p.productID, name: p.productName })));
		
		// Support cả format cũ và mới
		const finalAgentId = agentId || agentID;
		console.log('🔍 Looking for agent with ID:', finalAgentId);
		
		// Tìm đại lý
		const agent = agents.find(a => a.agentID === finalAgentId);
		console.log('🔍 Found agent:', agent);
		if (!agent) {
			console.log('❌ Agent not found with ID:', finalAgentId);
			return res.status(404).json({
				code: 404,
				status: 'error',
				message: 'Không tìm thấy đại lý'
			});
		}
		
		let finalTotalAmount = totalAmount || 0;
		
		// Nếu có productID và quantityExport, tính toán totalAmount
		if (productID && quantityExport) {
			console.log('🔍 Looking for product with ID:', productID);
			const product = products.find(p => p.productID === productID);
			console.log('🔍 Found product:', product);
			if (product) {
				finalTotalAmount = product.exportPrice * quantityExport;
				console.log('💰 Calculated total amount:', finalTotalAmount);
			}
		}
		
		// Tạo phiếu xuất mới
		const newExportReceipt = {
			exportReceiptID: exportReceipts.length > 0 ? Math.max(...exportReceipts.map(r => r.exportReceiptID)) + 1 : 1,
			agent: {
				agentID: agent.agentID,
				agentName: agent.agentName
			},
			createDate: createDate || new Date().toISOString().split('T')[0],
			totalAmount: finalTotalAmount,
			paidAmount: paidAmount || 0,
			remainingAmount: finalTotalAmount - (paidAmount || 0)
		};
		
		exportReceipts.push(newExportReceipt);
		
		// Nếu có chi tiết sản phẩm, tạo export detail
		if (productID && quantityExport) {
			const exportDetails = db.exportDetails || [];
			const product = products.find(p => p.productID === productID);
			
			if (product) {
				const newExportDetail = {
					exportDetailID: exportDetails.length > 0 ? Math.max(...exportDetails.map(d => d.exportDetailID)) + 1 : 1,
					exportReceiptID: newExportReceipt.exportReceiptID,
					productID: productID,
					productName: product.productName,
					quantity: quantityExport,
					unitPrice: product.exportPrice,
					totalPrice: product.exportPrice * quantityExport
				};
				
				exportDetails.push(newExportDetail);
				db.exportDetails = exportDetails;
			}
		}
		
		db.exportReceipts = exportReceipts;
		writeDB(db);
		
		res.status(201).json({
			code: 201,
			status: 'success',
			message: 'Tạo phiếu xuất thành công',
			data: newExportReceipt
		});
	} catch (error) {
		console.error('❌ Error in export-receipts POST:', error);
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống: ' + error.message
		});
	}
});

// PUT /api/export-receipts - Cập nhật phiếu xuất
app.put('/api/export-receipts', authenticateToken, (req, res) => {
	try {
		const { exportReceiptID, totalAmount, paidAmount } = req.body;
		const db = readDB();
		const exportReceipts = db.exportReceipts || [];
		
		const receiptIndex = exportReceipts.findIndex(r => r.exportReceiptID === exportReceiptID);
		
		if (receiptIndex === -1) {
			return res.status(404).json({
				code: 404,
				status: 'error',
				message: 'Không tìm thấy phiếu xuất'
			});
		}
		
		// Cập nhật phiếu xuất
		if (totalAmount !== undefined) exportReceipts[receiptIndex].totalAmount = totalAmount;
		if (paidAmount !== undefined) exportReceipts[receiptIndex].paidAmount = paidAmount;
		
		exportReceipts[receiptIndex].remainingAmount = 
			exportReceipts[receiptIndex].totalAmount - exportReceipts[receiptIndex].paidAmount;
		
		db.exportReceipts = exportReceipts;
		writeDB(db);
		
		res.json({
			code: 200,
			status: 'success',
			message: 'Cập nhật phiếu xuất thành công',
			data: exportReceipts[receiptIndex]
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống'
		});
	}
});

// DELETE /api/export-receipts/{id} - Xóa phiếu xuất
app.delete('/api/export-receipts/:id', authenticateToken, (req, res) => {
	try {
		const exportReceiptId = parseInt(req.params.id);
		const db = readDB();
		const exportReceipts = db.exportReceipts || [];
		
		const receiptIndex = exportReceipts.findIndex(r => r.exportReceiptID === exportReceiptId);
		
		if (receiptIndex === -1) {
			return res.status(404).json({
				code: 404,
				status: 'error',
				message: 'Không tìm thấy phiếu xuất'
			});
		}
		
		// Xóa cả các chi tiết phiếu xuất liên quan
		const exportDetails = db.exportDetails || [];
		db.exportDetails = exportDetails.filter(d => d.exportReceiptID !== exportReceiptId);
		
		// Xóa phiếu xuất
		exportReceipts.splice(receiptIndex, 1);
		db.exportReceipts = exportReceipts;
		writeDB(db);
		
		res.json({
			code: 200,
			status: 'success',
			message: 'Xóa phiếu xuất thành công'
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống'
		});
	}
});

// ============ EXPORT DETAILS ENDPOINTS ============

// GET /api/export-details/by-receipt/{exportReceiptId} - Lấy chi tiết theo phiếu xuất
app.get('/api/export-details/by-receipt/:exportReceiptId', authenticateToken, (req, res) => {
	try {
		const exportReceiptId = parseInt(req.params.exportReceiptId);
		const db = readDB();
		const exportDetails = db.exportDetails || [];
		
		const receiptDetails = exportDetails.filter(d => d.exportReceiptID === exportReceiptId);
		
		res.json({
			code: 200,
			status: 'success',
			message: 'Lấy chi tiết phiếu xuất thành công',
			data: receiptDetails
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống'
		});
	}
});

// POST /api/export-details - Tạo chi tiết phiếu xuất
app.post('/api/export-details', authenticateToken, (req, res) => {
	try {
		const { exportReceiptID, productID, quantity, unitPrice } = req.body;
		const db = readDB();
		const exportDetails = db.exportDetails || [];
		const products = db.products || [];
		
		// Tìm sản phẩm
		const product = products.find(p => p.productID === productID);
		if (!product) {
			return res.status(404).json({
				code: 404,
				status: 'error',
				message: 'Không tìm thấy sản phẩm'
			});
		}
		
		// Tạo chi tiết mới
		const newExportDetail = {
			exportDetailID: exportDetails.length > 0 ? Math.max(...exportDetails.map(d => d.exportDetailID)) + 1 : 1,
			exportReceiptID,
			productID,
			productName: product.productName,
			quantity,
			unitPrice: unitPrice || product.exportPrice,
			totalPrice: quantity * (unitPrice || product.exportPrice)
		};
		
		exportDetails.push(newExportDetail);
		db.exportDetails = exportDetails;
		writeDB(db);
		
		res.status(201).json({
			code: 201,
			status: 'success',
			message: 'Tạo chi tiết phiếu xuất thành công',
			data: newExportDetail
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống'
		});
	}
});

// ============ PARAMETERS ENDPOINTS ============

// GET /api/parameters - Lấy tất cả parameters
app.get('/api/parameters', authenticateToken, (req, res) => {
	try {
		const db = readDB();
		const parameters = db.parameters || [];
		
		res.json({
			code: 200,
			status: 'success',
			message: 'Lấy danh sách thông số thành công',
			data: parameters
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống: ' + error.message
		});
	}
});

// GET /api/parameters/{key} - Lấy parameter theo key
app.get('/api/parameters/:key', authenticateToken, (req, res) => {
	try {
		const paramKey = req.params.key;
		const db = readDB();
		const parameters = db.parameters || [];
		
		const parameter = parameters.find(p => p.param_key === paramKey);
		
		if (!parameter) {
			return res.status(404).json({
				code: 404,
				status: 'error',
				message: 'Không tìm thấy thông số'
			});
		}
		
		res.json({
			code: 200,
			status: 'success',
			message: 'Lấy thông số thành công',
			data: parameter
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống: ' + error.message
		});
	}
});

// PUT /api/parameters/{key} - Cập nhật parameter
app.put('/api/parameters/:key', authenticateToken, (req, res) => {
	try {
		const paramKey = req.params.key;
		const { param_value } = req.body;
		const db = readDB();
		const parameters = db.parameters || [];
		
		const paramIndex = parameters.findIndex(p => p.param_key === paramKey);
		
		if (paramIndex === -1) {
			return res.status(404).json({
				code: 404,
				status: 'error',
				message: 'Không tìm thấy thông số'
			});
		}
		
		// Validate value based on param type
		if (paramKey === 'max_agent_per_district') {
			const numValue = parseInt(param_value);
			if (isNaN(numValue) || numValue < 1) {
				return res.status(400).json({
					code: 400,
					status: 'error',
					message: 'Số lượng đại lý tối đa phải là số nguyên dương'
				});
			}
			parameters[paramIndex].param_value = numValue.toString();
		} else if (paramKey === 'export_price_ratio') {
			const numValue = parseFloat(param_value);
			if (isNaN(numValue) || numValue <= 0) {
				return res.status(400).json({
					code: 400,
					status: 'error',
					message: 'Tỷ lệ giá xuất phải là số dương'
				});
			}
			
			// Store old value for comparison
			const oldValue = parseFloat(parameters[paramIndex].param_value);
			parameters[paramIndex].param_value = numValue.toString();
			
			// SIDE EFFECT: Update all products' export prices when ratio changes
			const products = db.products || [];
			let updatedProductsCount = 0;
			
			products.forEach(product => {
				const importPrice = product.importPrice || product.import_price || 0;
				if (importPrice > 0) {
					const newExportPrice = Math.round(importPrice * numValue);
					const oldExportPrice = product.exportPrice || product.export_price || 0;
					
					// Update export price
					if (product.exportPrice !== undefined) {
						product.exportPrice = newExportPrice;
					}
					if (product.export_price !== undefined) {
						product.export_price = newExportPrice;
					}
					
					updatedProductsCount++;
					console.log(`Updated product: ${product.productName || product.product_name} - Export price: ${oldExportPrice} -> ${newExportPrice}`);
				}
			});
			
			console.log(`Updated export_price_ratio from ${oldValue} to ${numValue}. Updated ${updatedProductsCount} products.`);
		} else {
			parameters[paramIndex].param_value = param_value;
		}
		
		db.parameters = parameters;
		writeDB(db);
		
		// Custom message for export_price_ratio updates
		let message = 'Cập nhật thông số thành công';
		if (paramKey === 'export_price_ratio' && updatedProductsCount !== undefined) {
			message = `Cập nhật tỷ lệ giá xuất thành công! Đã tự động cập nhật giá xuất cho ${updatedProductsCount} sản phẩm.`;
		}
		
		res.json({
			code: 200,
			status: 'success',
			message: message,
			data: {
				...parameters[paramIndex],
				...(paramKey === 'export_price_ratio' && { 
					updatedProductsCount: updatedProductsCount || 0 
				})
			}
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống: ' + error.message
		});
	}
});

// POST /api/parameters - Tạo parameter mới
app.post('/api/parameters', authenticateToken, (req, res) => {
	try {
		const { param_key, param_value, param_description } = req.body;
		const db = readDB();
		const parameters = db.parameters || [];
		
		// Check if parameter key already exists
		if (parameters.find(p => p.param_key === param_key)) {
			return res.status(400).json({
				code: 400,
				status: 'error',
				message: 'Khóa thông số đã tồn tại'
			});
		}
		
		const newParameter = {
			param_key,
			param_value,
			param_description: param_description || ''
		};
		
		parameters.push(newParameter);
		db.parameters = parameters;
		writeDB(db);
		
		res.status(201).json({
			code: 201,
			status: 'success',
			message: 'Tạo thông số thành công',
			data: newParameter
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống: ' + error.message
		});
	}
});

// DELETE /api/parameters/{key} - Xóa parameter
app.delete('/api/parameters/:key', authenticateToken, (req, res) => {
	try {
		const paramKey = req.params.key;
		const db = readDB();
		const parameters = db.parameters || [];
		
		const paramIndex = parameters.findIndex(p => p.param_key === paramKey);
		
		if (paramIndex === -1) {
			return res.status(404).json({
				code: 404,
				status: 'error',
				message: 'Không tìm thấy thông số'
			});
		}
		
		parameters.splice(paramIndex, 1);
		db.parameters = parameters;
		writeDB(db);
		
		res.json({
			code: 200,
			status: 'success',
			message: 'Xóa thông số thành công'
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			status: 'error',
			message: 'Lỗi hệ thống: ' + error.message
		});
	}
});

console.log('Starting server with endpoints:');
console.log('Authentication: /api/auth/*');
console.log('Users: /api/users/*');
console.log('Agents: /agent/*');
console.log('Products: /product/*');
console.log('Export Receipts: /api/export-receipts/*');
console.log('Export Details: /api/export-details/*');
console.log('Parameters: /api/parameters/*');
console.log('Categories: /api/units, /api/districts, /api/agent-types');
console.log('Reports: /debtReport/*');

app.listen(PORT, () => {
	console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
