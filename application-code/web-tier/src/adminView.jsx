import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Select, MenuItem } from '@mui/material';

const AdminView = ({ token, handleLogout }) => {
    const [expenses, setExpenses] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [sortByUser, setSortByUser] = useState(false); // State to toggle sorting by user

    useEffect(() => {
        if (token) {
            checkAdmin();
            fetchAllExpenses();
        }
    }, [token]);

    const checkAdmin = async () => {
        try {
            const response = await axios.get('http://localhost:5000/user', {
                headers: { Authorization: token },
            });
            setIsAdmin(response.data.role === 'admin');
        } catch (error) {
            console.error('Failed to verify admin role', error);
        }
    };

    const fetchAllExpenses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/all-expenses', {
                headers: { Authorization: token },
            });
            setExpenses(response.data);
        } catch (error) {
            console.error('Failed to fetch expenses', error);
        }
    };

    // Group expenses by username
    const groupExpensesByUser = () => {
        const grouped = {};
        expenses.forEach((expense) => {
            if (!grouped[expense.username]) {
                grouped[expense.username] = [];
            }
            grouped[expense.username].push(expense);
        });
        return grouped;
    };

    // Calculate total cost for a user's expenses
    const calculateUserTotal = (userExpenses) => {
        return userExpenses.reduce((total, expense) => total + expense.price * expense.quantity, 0).toFixed(2);
    };

    if (!isAdmin) {
        return <Typography variant="h6" color="error">Access Denied: Admins Only</Typography>;
    }

    const groupedExpenses = sortByUser ? groupExpensesByUser() : null;

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>Admin - All User Expenses</Typography>
            <Button
                variant="contained"
                color="error"
                onClick={handleLogout}
                style={{ margin: '10px' }}
            >
                Logout
            </Button>

            {/* Sort by User Toggle */}
            <Select
                value={sortByUser}
                onChange={(e) => setSortByUser(e.target.value)}
                style={{ margin: '10px' }}
            >
                <MenuItem value={false}>Show All Expenses</MenuItem>
                <MenuItem value={true}>Sort By User</MenuItem>
            </Select>

            {sortByUser ? (
                // Display expenses grouped by user
                Object.keys(groupedExpenses).map((username) => (
                    <div key={username}>
                        {/* Display Username */}
                        <Typography variant="h5" style={{ marginTop: '20px' }}>User: {username}</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>Category</b></TableCell>
                                        <TableCell><b>Item</b></TableCell>
                                        <TableCell><b>Quantity</b></TableCell>
                                        <TableCell><b>Price</b></TableCell>
                                        <TableCell><b>Total Cost</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {groupedExpenses[username].map((expense) => (
                                        <TableRow key={expense.id}>
                                            <TableCell>{expense.category_name}</TableCell>
                                            <TableCell>{expense.item}</TableCell>
                                            <TableCell>{expense.quantity}</TableCell>
                                            <TableCell>${expense.price}</TableCell>
                                            <TableCell>${(expense.price * expense.quantity).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Total Row for the User */}
                                    <TableRow>
                                        <TableCell colSpan={4} align="right"><b>Total:</b></TableCell>
                                        <TableCell><b>${calculateUserTotal(groupedExpenses[username])}</b></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                ))
            ) : (
                // Display all expenses in a single table
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Username</b></TableCell>
                                <TableCell><b>Category</b></TableCell>
                                <TableCell><b>Item</b></TableCell>
                                <TableCell><b>Quantity</b></TableCell>
                                <TableCell><b>Price</b></TableCell>
                                <TableCell><b>Total Cost</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {expenses.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell>{expense.username}</TableCell>
                                    <TableCell>{expense.category_name}</TableCell>
                                    <TableCell>{expense.item}</TableCell>
                                    <TableCell>{expense.quantity}</TableCell>
                                    <TableCell>${expense.price}</TableCell>
                                    <TableCell>${(expense.price * expense.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                            {/* Total Row for All Expenses */}
                            <TableRow>
                                <TableCell colSpan={5} align="right"><b>Total:</b></TableCell>
                                <TableCell><b>${expenses.reduce((total, expense) => total + expense.price * expense.quantity, 0).toFixed(2)}</b></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default AdminView;