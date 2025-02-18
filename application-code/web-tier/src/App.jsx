import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Card, CardContent, Grid, Tabs, Tab, Box, MenuItem, Select, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControl, InputLabel, Switch, FormGroup, FormControlLabel,useMediaQuery, useTheme, Alert, CircularProgress } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
const API_BASE_URL = "http://54.84.115.252/api";


const App = () => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null); 
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState(null);
    const [registerError, setRegisterError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);  
    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newCategory, setNewCategory] = useState('');
    const [newExpense, setNewExpense] = useState({ category_id: '', item: '', quantity: '', price: '' });
    const [tabIndex, setTabIndex] = useState(0);
    const [expenseReportEnabled, setExpenseReportEnabled] = useState(false);
    const [reportFrequency, setReportFrequency] = useState("weekly");
    const [reportEmail, setReportEmail] = useState("");
  

    useEffect(() => {
        if (token) {
            fetchUser();
            fetchCategories();
            fetchReportSettings();
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
        setLoading(true);
        setLoginError(null);
        setSuccessMessage(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
            localStorage.setItem('token', response.data.token);
            setToken(response.data.token);
        } catch (error) {
            setLoginError(error.response?.data?.message || "Login failed.");
        }

        setLoading(false);
    };

    const handleRegister = async () => {
        setLoading(true);
        setRegisterError(null);
        setSuccessMessage(null);

        try {
            await axios.post(`${API_BASE_URL}/register`, { username, password });
            alert('User registered successfully');
        } catch (error) {
            setRegisterError(error.response?.data?.message || "Registration failed.");
        }

        setLoading(false);
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


  const fetchReportSettings = async () => {
    try {
      const response = await axios.get("http://localhost:5000/report-settings", {
        headers: { Authorization: token },
      });

      if (response.data) {
        setExpenseReportEnabled(response.data.enabled);
        setReportFrequency(response.data.frequency);
        setReportEmail(response.data.email);
      }
    } catch (error) {
      console.error("Failed to fetch report settings", error);
    }
  };

  const handleReportToggle = async () => {
    const newStatus = !expenseReportEnabled;
    setExpenseReportEnabled(newStatus);

    if (!newStatus) {
      setReportEmail("");
      setReportFrequency("weekly");
    }

    await saveReportSettings(newStatus, reportFrequency, reportEmail);
  };

  const saveReportSettings = async (enabled, frequency, email) => {
    try {
      await axios.post(
        "http://localhost:5000/report-settings",
        { enabled, frequency, email },
        { headers: { Authorization: token } }
      );
    } catch (error) {
      console.error("Failed to save report settings", error);
    }
  };


    return (
        <Container maxWidth="md" style={{ marginTop: '20px', textAlign: 'center' }}>
            {!token ? (
        <Card>
        <CardContent>
          <Typography variant="h4">Login</Typography>

          {/* Display success message after registration */}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}

          {/* Login Error Message */}
          {loginError && <Alert severity="error">{loginError}</Alert>}

          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!loginError}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!loginError}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            sx={{ marginTop: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>

          {/* Registration */}
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Don't have an account?
          </Typography>

          {/* Registration Error Message */}
          {registerError && <Alert severity="error">{registerError}</Alert>}

          <Button
            variant="contained"
            color="secondary"
            onClick={handleRegister}
            sx={{ marginTop: 1 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Register"}
          </Button>
        </CardContent>
      </Card>
            ) : (
                <>
                    <Typography variant="h3">Expense Management System</Typography>
                    {user && <Typography variant="h5">Welcome, {user.username}!</Typography>}
                    <Button variant="contained" color="error"  onClick={handleLogout} style={{ margin: '10px' }}>Logout</Button>
                    
                    <Box sx={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", gap: 2, marginTop: "20px" }}>
                        
                        {/* Left Column (Expense Report + Add Category) */}
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                        
                        {/* Expense Report Card */}
                        <Card>
                            <CardContent>
                            <Typography variant="h6">Expense Report Settings</Typography>
                            <FormGroup>
                                <FormControlLabel
                                control={
                                    <Switch checked={expenseReportEnabled} onChange={handleReportToggle} />
                                }
                                label="Enable Expense Reports"
                                />
                            </FormGroup>

                            {expenseReportEnabled && (
                                <>
                                <FormControl fullWidth sx={{ marginTop: 2 }}>
                                    <InputLabel>Report Frequency</InputLabel>
                                    <Select
                                    value={reportFrequency}
                                    onChange={(e) => {
                                        setReportFrequency(e.target.value);
                                        saveReportSettings(expenseReportEnabled, e.target.value, reportEmail);
                                    }}
                                    >
                                    <MenuItem value="daily">Daily</MenuItem>
                                    <MenuItem value="weekly">Weekly</MenuItem>
                                    <MenuItem value="monthly">Monthly</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    variant="outlined"
                                    margin="normal"
                                    value={reportEmail}
                                    onChange={(e) => {
                                    setReportEmail(e.target.value);
                                    saveReportSettings(expenseReportEnabled, reportFrequency, e.target.value);
                                    }}
                                />
                                </>
                            )}
                            </CardContent>
                        </Card>

                        {/* Add Category Card */}
                        <Card>
                            <CardContent>
                            <Typography variant="h6">Create New Category</Typography>
                            <TextField
                                fullWidth
                                label="New Category"
                                variant="outlined"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={addCategory}
                                sx={{ marginTop: 2 }}
                            >
                                Create
                            </Button>
                            </CardContent>
                        </Card>

                        </Box>

                        {/* Right Column (Add Expense) */}
                        <Box sx={{ flex: 1 }}>
                        <Card>
                                <CardContent>
                                    <Typography variant="h6">Add Expense</Typography>
                                    <TextField fullWidth label="Item" variant="outlined" value={newExpense.item} onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })} sx={{ marginBottom: 2 }} />
                                    <TextField fullWidth label="Quantity" variant="outlined" value={newExpense.quantity} onChange={(e) => setNewExpense({ ...newExpense, quantity: e.target.value })} sx={{ marginBottom: 2 }} />
                                    <TextField fullWidth label="Price" variant="outlined" value={newExpense.price} onChange={(e) => setNewExpense({ ...newExpense, price: e.target.value })} sx={{ marginBottom: 2 }} />
                                    <Select fullWidth value={newExpense.category_id} onChange={(e) => setNewExpense({ ...newExpense, category_id: e.target.value })} displayEmpty sx={{ marginBottom: 2 }}>
                                        <MenuItem value="" disabled>Select Category</MenuItem>
                                        {categories.map(category => (
                                            <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                                        ))}
                                    </Select>
                                    <Button variant="contained" color="primary" onClick={addExpense} style={{ margin: '10px' }}>Add Expense</Button>
                                </CardContent>
                            </Card>
                        </Box>

                    </Box>
                    
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
