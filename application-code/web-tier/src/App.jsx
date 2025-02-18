import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Card, CardContent, Grid, Tabs, Tab, Box, MenuItem, Select, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControl, InputLabel, Switch, FormGroup, FormControlLabel, } from '@mui/material';
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
        await axios.post('http://localhost:5000/expenses', newExpense, { headers: { Authorization: token } });
        setNewExpense({ category_id: '', item: '', quantity: '', price: '' });
        fetchExpenses(newExpense.category_id);
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
            {/* Left Column: Expense Report + Add Category */}
            <Grid item xs={12} sm={6}>

              {/* Expense Report Card */}
              <Card style={{ marginBottom: "10px" }}>
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
                      <FormControl fullWidth style={{ marginTop: "10px" }}>
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
                    style={{ margin: "10px" }}
                  >
                    Create
                  </Button>
                </CardContent>
              </Card>

            </Grid>

            {/* Right Column: Add Expense */}
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Add Expense</Typography>
                  <TextField fullWidth label="Item" variant="outlined" />
                  <TextField fullWidth label="Quantity" variant="outlined" />
                  <TextField fullWidth label="Price" variant="outlined" />
                  <FormControl fullWidth>
                    <InputLabel>Select Category</InputLabel>
                    <Select>
                      <MenuItem value="" disabled>
                        Select Category
                      </MenuItem>
                      {/* Category Options Here */}
                    </Select>
                  </FormControl>
                  <Button variant="contained" color="primary" style={{ margin: "10px" }}>
                    Add Expense
                  </Button>
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
