import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, Tabs, Tab, Box, MenuItem, Select, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
const API_BASE_URL = "http://54.84.115.252/api";


const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newCategory, setNewCategory] = useState('');
    const [newExpense, setNewExpense] = useState({ category_id: '', item: '', quantity: '', price: '' });
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        if (token) {
            fetchUser();
            fetchCategories();
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user`, { headers: { Authorization: token } });
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user', error);
        }
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
            localStorage.setItem('token', response.data.token);
            setToken(response.data.token);
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    const handleRegister = async () => {
        try {
            await axios.post(`${API_BASE_URL}/register`, { username, password });
            alert('User registered successfully');
        } catch (error) {
            console.error('Registration failed', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const fetchCategories = async () => {
        const response = await axios.get(`${API_BASE_URL}/categories`, { headers: { Authorization: token } });
        setCategories(response.data);
    };

    const addCategory = async () => {
        await axios.post(`${API_BASE_URL}/categories`, { name: newCategory }, { headers: { Authorization: token } });
        setNewCategory('');
        fetchCategories();
    };

    const updateCategory = async (id, newName) => {
        await axios.put(`${API_BASE_URL}/categories/${id}`, { name: newName }, { headers: { Authorization: token } });
        fetchCategories();
    };

    const deleteCategory = async (id) => {
        await axios.delete(`${API_BASE_URL}/categories/${id}`, { headers: { Authorization: token } });
        fetchCategories();
    };

    const fetchExpenses = async (categoryId) => {
        setSelectedCategory(categoryId);
        const response = await axios.get(`${API_BASE_URL}/expenses/${categoryId}`, { headers: { Authorization: token } });
        setExpenses(response.data);
    };

    const addExpense = async () => {
        await axios.post(`${API_BASE_URL}/expenses`, newExpense, { headers: { Authorization: token } });
        setNewExpense({ category_id: '', item: '', quantity: '', price: '' });
        fetchExpenses(newExpense.category_id);
    };

    const updateExpense = async (id, updatedExpense) => {
        await axios.put(`${API_BASE_URL}/expenses/${id}`, updatedExpense, { headers: { Authorization: token } });
        fetchExpenses(selectedCategory);
    };

    const deleteExpense = async (id) => {
        await axios.delete(`${API_BASE_URL}/expenses/${id}`, { headers: { Authorization: token } });
        fetchExpenses(selectedCategory);
    };

    const calculateTotalExpenses = () => {
        return expenses.reduce((total, expense) => total + (expense.price * expense.quantity), 0);
    };

  const calculateCategoryTotal = (categoryId) => {
      return expenses
          .filter(expense => expense.category_id === categoryId)
          .reduce((total, expense) => total + (expense.price * expense.quantity), 0);
  };
  const calculateItemTotal = (expense) => {
    return (expense.price * expense.quantity).toFixed(2);
  };

    return (
        <Container maxWidth="md" style={{ marginTop: '20px', textAlign: 'center' }}>
            {!token ? (
                <Card>
                    <CardContent>
                        <Typography variant="h4">Login</Typography>
                        <TextField fullWidth label="Username" variant="outlined" margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <TextField fullWidth label="Password" type="password" variant="outlined" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Button variant="contained" color="primary" onClick={handleLogin} style={{ margin: '10px' }}>Login</Button>
                        <Button variant="contained" color="secondary" onClick={handleRegister}>Register</Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Typography variant="h3">Expense Management System</Typography>
                    {user && <Typography variant="h5">Welcome, {user.username}!</Typography>}
                    <Button variant="contained" color="error"  onClick={handleLogout} style={{ margin: '10px' }}>Logout</Button>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Create New Category</Typography>
                                    <TextField fullWidth label="New Category" variant="outlined" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                                    <Button variant="contained" color="primary" onClick={addCategory} style={{ margin: '10px' }}>Create</Button>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Add Expense</Typography>
                                    <TextField fullWidth label="Item" variant="outlined" value={newExpense.item} onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })} />
                                    <TextField fullWidth label="Quantity" variant="outlined" value={newExpense.quantity} onChange={(e) => setNewExpense({ ...newExpense, quantity: e.target.value })} />
                                    <TextField fullWidth label="Price" variant="outlined" value={newExpense.price} onChange={(e) => setNewExpense({ ...newExpense, price: e.target.value })} />
                                    <Select fullWidth value={newExpense.category_id} onChange={(e) => setNewExpense({ ...newExpense, category_id: e.target.value })} displayEmpty>
                                        <MenuItem value="" disabled>Select Category</MenuItem>
                                        {categories.map(category => (
                                            <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                                        ))}
                                    </Select>
                                    <Button variant="contained" color="primary" onClick={addExpense} style={{ margin: '10px' }}>Add Expense</Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    
                    <Card style={{ marginTop: '20px' }}>
                        <CardContent>
                            <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} aria-label="category-tabs">
                                {categories.map((category, index) => (
                                    <Tab key={category.id} label={category.name} onClick={() => fetchExpenses(category.id)} />
                                ))}
                            </Tabs>
                            <Box mt={2}>
                                {selectedCategory && (
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6">
                                                Managing Category: {categories.find(cat => cat.id === selectedCategory)?.name}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                color="warning"
                                                onClick={() => {
                                                    const newName = prompt('Enter new category name:');
                                                    if (newName) updateCategory(selectedCategory, newName);
                                                }}
                                                style={{ margin: '5px' }}
                                            >
                                                Edit Category
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                onClick={() => deleteCategory(selectedCategory)}
                                                style={{ margin: '5px' }}
                                            >
                                                Delete Category
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                {selectedCategory && (
                                    <TableContainer component={Paper} style={{ marginTop: '10px' }}>
                                        <Typography variant="h6">
                                            Expenses For Category: {categories.find(cat => cat.id === selectedCategory)?.name}
                                        </Typography>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Item</TableCell>
                                                    <TableCell>Quantity</TableCell>
                                                    <TableCell>Price</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {expenses.map(expense => (
                                                    <TableRow key={expense.id}>
                                                        <TableCell>{expense.item}</TableCell>
                                                        <TableCell>{expense.quantity}</TableCell>
                                                        <TableCell>${expense.price}</TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                color="warning"
                                                                onClick={() => {
                                                                    const updatedExpense = {
                                                                        item: prompt('New Item:', expense.item),
                                                                        quantity: prompt('New Quantity:', expense.quantity),
                                                                        price: prompt('New Price:', expense.price),
                                                                    };
                                                                    if (updatedExpense.item && updatedExpense.quantity && updatedExpense.price) {
                                                                        updateExpense(expense.id, updatedExpense);
                                                                    }
                                                                }}
                                                            >
                                                                <Edit />
                                                            </IconButton>
                                                            <IconButton color="error" onClick={() => deleteExpense(expense.id)}>
                                                                <Delete />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Box>

                        </CardContent>
                    </Card>
                </>
            )}
        </Container>
    );
};

export default App;
