import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    return (
        <div>
            {!token ? (
                <div>
                    <h2>Login</h2>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                    <button onClick={handleLogin}>Login</button>
                    <button onClick={handleRegister}>Register</button>
                </div>
            ) : (
                <div>
                    <h1>Expense Management System</h1>
                    {user && <h2>Welcome, {user.username}!</h2>}
                    <h3>Total Expenses: ${calculateTotalExpenses().toFixed(2)}</h3>
                    <button onClick={handleLogout}>Logout</button>
                    <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New Category" />
                    <button onClick={addCategory}>Create New Category</button>
                    <h2>Categories</h2>
                    {categories.map(category => (
                        <div key={category.id}>
                            <button onClick={() => fetchExpenses(category.id)}>{category.name}</button>
                            <span> Total: ${calculateCategoryTotal(category.id).toFixed(2)}</span>
                            <button onClick={() => updateCategory(category.id, prompt('Enter new name:', category.name))}>Update</button>
                            <button onClick={() => deleteCategory(category.id)}>Delete</button>
                        </div>
                    ))}
                    {selectedCategory && (
                        <div>
                            <h2>Expenses</h2>
                            <ul>
                                {expenses.map(expense => (
                                    <li key={expense.id}>
                                        {expense.item} - {expense.quantity} - ${expense.price} (Total: ${ (expense.price * expense.quantity).toFixed(2) })
                                        <button onClick={() => updateExpense(expense.id, { item: prompt('New Item:', expense.item), quantity: prompt('New Quantity:', expense.quantity), price: prompt('New Price:', expense.price) })}>Update</button>
                                        <button onClick={() => deleteExpense(expense.id)}>Delete</button>
                                    </li>
                                ))}
                            </ul>
                            <input value={newExpense.item} onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })} placeholder="Item Name" />
                            <input value={newExpense.quantity} onChange={(e) => setNewExpense({ ...newExpense, quantity: e.target.value })} placeholder="Quantity" />
                            <input value={newExpense.price} onChange={(e) => setNewExpense({ ...newExpense, price: e.target.value })} placeholder="Price" />
                            <button onClick={addExpense}>Add Expense</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default App;
