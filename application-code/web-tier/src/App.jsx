import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newCategory, setNewCategory] = useState('');
    const [newExpense, setNewExpense] = useState({ item: '', quantity: '', price: '' });

    useEffect(() => {
        if (token) {
            fetchUser();
            fetchCategories();
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await axios.get('http://localhost:5000/user', { headers: { Authorization: token } });
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user', error);
        }
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/login', { username, password });
            localStorage.setItem('token', response.data.token);
            setToken(response.data.token);
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    const handleRegister = async () => {
        try {
            await axios.post('http://localhost:5000/register', { username, password });
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
        const response = await axios.get('http://localhost:5000/categories', { headers: { Authorization: token } });
        setCategories(response.data);
    };

    const addCategory = async () => {
        await axios.post('http://localhost:5000/categories', { name: newCategory }, { headers: { Authorization: token } });
        setNewCategory('');
        fetchCategories();
    };

    const updateCategory = async (id, newName) => {
        await axios.put(`http://localhost:5000/categories/${id}`, { name: newName }, { headers: { Authorization: token } });
        fetchCategories();
    };

    const deleteCategory = async (id) => {
        await axios.delete(`http://localhost:5000/categories/${id}`, { headers: { Authorization: token } });
        fetchCategories();
    };

    const fetchExpenses = async (categoryId) => {
        setSelectedCategory(categoryId);
        const response = await axios.get(`http://localhost:5000/expenses/${categoryId}`, { headers: { Authorization: token } });
        setExpenses(response.data);
    };

    const addExpense = async () => {
        await axios.post('http://localhost:5000/expenses', { category_id: selectedCategory, ...newExpense }, { headers: { Authorization: token } });
        setNewExpense({ item: '', quantity: '', price: '' });
        fetchExpenses(selectedCategory);
    };

    const updateExpense = async (id, updatedExpense) => {
        await axios.put(`http://localhost:5000/expenses/${id}`, updatedExpense, { headers: { Authorization: token } });
        fetchExpenses(selectedCategory);
    };

    const deleteExpense = async (id) => {
        await axios.delete(`http://localhost:5000/expenses/${id}`, { headers: { Authorization: token } });
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
                    <Typography variant="h6">Total Expenses: ${calculateTotalExpenses().toFixed(2)}</Typography>
                    <Button variant="contained" color="error" onClick={handleLogout} style={{ margin: '10px' }}>Logout</Button>
                    <TextField label="New Category" variant="outlined" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                    <Button variant="contained" color="primary" onClick={addCategory} style={{ margin: '10px' }}>Create New Category</Button>
                    <Typography variant="h4">Categories</Typography>
                    <Grid container spacing={2}>
                        {categories.map(category => (
                            <Grid item xs={12} sm={6} key={category.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">{category.name}</Typography>
                                        <Typography variant="subtitle1">Total: ${calculateCategoryTotal(category.id).toFixed(2)}</Typography>
                                        <Button variant="contained" onClick={() => fetchExpenses(category.id)}>View Expenses</Button>
                                        <IconButton color="warning"  onClick={() => updateCategory(category.id, prompt('Enter new name:', category.name))}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => deleteCategory(category.id)}>
                                            <Delete />
                                        </IconButton>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    {selectedCategory && (
                        <>
                            <Typography variant="h4">Expenses</Typography>
                            <List>
                                {expenses.map(expense => (
                                    <ListItem key={expense.id}>
                                        <ListItemText primary={`${expense.item} - ${expense.quantity} - $${expense.price} (Total: $${calculateItemTotal(expense)})`} />
                                        <IconButton color="warning" onClick={() => updateExpense(expense.id, { item: prompt('New Item:', expense.item), quantity: prompt('New Quantity:', expense.quantity), price: prompt('New Price:', expense.price) })}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => deleteExpense(expense.id)}>
                                            <Delete />
                                        </IconButton>
                                    </ListItem>
                                ))}
                            </List>
                            <TextField label="Item" variant="outlined" value={newExpense.item} onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })} />
                            <TextField label="Quantity" variant="outlined" value={newExpense.quantity} onChange={(e) => setNewExpense({ ...newExpense, quantity: e.target.value })} />
                            <TextField label="Price" variant="outlined" value={newExpense.price} onChange={(e) => setNewExpense({ ...newExpense, price: e.target.value })} />
                            <Button variant="contained" color="primary" onClick={addExpense}>Add Expense</Button>
                        </>
                    )}
                </>
            )}
        </Container>
    );
};

export default App;
