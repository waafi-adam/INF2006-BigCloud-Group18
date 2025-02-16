import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [items, setItems] = useState([]);
  const [auth, setAuth] = useState({ username: '', email: '', password: '' });
  const [formData, setFormData] = useState({ item_name: '', price: '', quantity: '' });
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:5000/items', { headers: { Authorization: token } })
        .then(response => setItems(response.data))
        .catch(error => console.error(error));
    }
  }, [token]);

  const handleLogin = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/login', { email: auth.email, password: auth.password })
      .then(response => {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        axios.defaults.headers.common['Authorization'] = response.data.token; // ✅ Set Authorization globally
      })
      .catch(error => console.error(error));
  };
  

  const handleRegister = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/register', auth)
      .then(() => handleLogin(e))
      .catch(error => console.error(error));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    delete axios.defaults.headers.common['Authorization']; // ✅ Remove token from Axios headers
    setItems([]);
  };
  

  const handleAddItem = (e) => {
    e.preventDefault();
  
    if (editingItem) {
      axios.put(`http://localhost:5000/items/${editingItem.item_id}`, formData)
        .then(() => {
          setItems(prevItems =>
            prevItems.map(item => item.item_id === editingItem.item_id ? { ...item, ...formData } : item)
          );
          setEditingItem(null);
          setFormData({ item_name: '', price: '', quantity: '' });
        })
        .catch(error => console.error(error));
    } else {
      axios.post('http://localhost:5000/items', formData)
        .then(() => {
          axios.get('http://localhost:5000/items') // ✅ Refresh item list after adding new item
            .then(response => setItems(response.data));
          setFormData({ item_name: '', price: '', quantity: '' });
        })
        .catch(error => console.error(error));
    }
  };
  

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ item_name: item.item_name, price: item.price, quantity: item.quantity });
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/items/${id}`)
      .then(() => {
        axios.get('http://localhost:5000/items') // ✅ Ensure frontend refreshes after deleting
          .then(response => setItems(response.data));
      })
      .catch(error => console.error(error));
  };
  
  // Calculate total amount dynamically
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div>
      {!token ? (
        <div>
          <h1>Login / Register</h1>

          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} />
            <input type="password" placeholder="Password" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} />
            <button type="submit">Login</button>
          </form>

          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Username" value={auth.username} onChange={(e) => setAuth({ ...auth, username: e.target.value })} />
            <input type="email" placeholder="Email" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} />
            <input type="password" placeholder="Password" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} />
            <button type="submit">Register</button>
          </form>
        </div>
      ) : (
        <div>
          <h1>Grocery List</h1>
          <button onClick={handleLogout} style={{ backgroundColor: 'red', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
            Logout
          </button>

          <form onSubmit={handleAddItem}>
            <input type="text" placeholder="Item Name" value={formData.item_name} onChange={(e) => setFormData({ ...formData, item_name: e.target.value })} />
            <input type="number" placeholder="Price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            <input type="number" placeholder="Quantity" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
            <button type="submit">{editingItem ? 'Update Item' : 'Add Item'}</button>
          </form>

          <h2>Total Amount: ${totalAmount.toFixed(2)}</h2>

          <ul>
            {items.map((item, index) => (
              <li key={index}>
                {item.item_name} - ${item.price} x {item.quantity}
                <button onClick={() => handleEdit(item)} style={{ marginLeft: '10px' }}>Edit</button>
                <button onClick={() => handleDelete(item.item_id)} style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
