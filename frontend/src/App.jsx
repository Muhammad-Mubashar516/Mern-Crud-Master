import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';

// 👇 Fetch Function Updated
const fetchProducts = async ({ queryKey }) => {
  const [_, searchTerm] = queryKey; // Search term nikala
  // URL: http://localhost:5000/api/products?search=keyword
  const res = await api.get(`/products?search=${searchTerm || ""}`);
  return res.data;
};

function App() {
  const queryClient = useQueryClient();
  
  // States
  const [search, setSearch] = useState(""); // 🔍 Search State
  const [form, setForm] = useState({ name: "", price: "", category: "", description: "" });
  const [image, setImage] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [editId, setEditId] = useState(null);

  // 1. Get Data (Auto Refresh jab Search change ho)
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products', search], // 👈 Dependency array mein search dala
    queryFn: fetchProducts,
    keepPreviousData: true
  });

  // 2. Create/Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      if (editId) return api.put(`/products/${editId}`, formData);
      else return api.post('/products', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setForm({ name: "", price: "", category: "", description: "" });
      setImage(null); setPdf(null);
      document.getElementById("imgInput").value = "";
      document.getElementById("pdfInput").value = "";
      setEditId(null);
      alert(editId ? "Updated!" : "Added!");
    },
    onError: () => alert("Failed to save.")
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      alert("Deleted!");
    }
  });

  // Handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('category', form.category);
    formData.append('description', form.description);
    if (image) formData.append('image', image);
    if (pdf) formData.append('pdf', pdf);
    saveMutation.mutate(formData);
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, price: p.price, category: p.category, description: p.description });
    setEditId(p._id);
    setImage(null); setPdf(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        
        {/* --- 🔍 SEARCH BAR --- */}
        <div className="search-container">
            <input 
                type="text" 
                placeholder="🔍 Search products (e.g. Laptop, Phone)..." 
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)} // Type karte hi search chalega
            />
        </div>

        {/* --- FORM SECTION --- */}
        <div className="form-box">
          <h2>{editId ? "✏️ Edit Product" : "➕ Add Product"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
                <input placeholder="Name" required value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
                <input placeholder="Price" type="number" required value={form.price} onChange={e => setForm({...form, price:e.target.value})} />
            </div>
            <input placeholder="Category" required value={form.category} onChange={e => setForm({...form, category:e.target.value})} />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description:e.target.value})} />
            
            <div className="file-group">
                <label>Image:</label> <input id="imgInput" type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
            </div>
            <div className="file-group">
                <label>PDF:</label> <input id="pdfInput" type="file" accept="application/pdf" onChange={e => setPdf(e.target.files[0])} />
            </div>

            <div className="btn-group">
                <button type="submit" className="btn-save">{saveMutation.isPending ? "Saving..." : (editId ? "Update" : "Publish")}</button>
                {editId && <button onClick={() => {setEditId(null); setForm({name:"", price:"", category:"", description:""})}} className="btn-cancel">Cancel</button>}
            </div>
          </form>
        </div>

        {/* --- LIST / NOT FOUND --- */}
        <h2 className="section-title">Store Products</h2>
        
        {isLoading ? <h3>Loading...</h3> : null}
        
        <div className="grid">
          {products && products.length > 0 ? (
            products.map((p) => (
              <div key={p._id} className="card">
                <div className="card-img">
                  {p.image ? <img src={`http://localhost:5000/${p.image}`} alt={p.name} /> : <div className="no-img">No Image</div>}
                </div>
                <div className="card-body">
                  <div className="card-header">
                      <h3>{p.name}</h3>
                      <span className="price">${p.price}</span>
                  </div>
                  <span className="category-badge">{p.category}</span>
                  <p className="desc">{p.description}</p>
                  
                  {p.pdf ? <a href={`http://localhost:5000/${p.pdf}`} target="_blank" className="pdf-link">📄 Manual</a> : <span className="no-pdf">No Manual</span>}

                  <div className="actions">
                      <button onClick={() => handleEdit(p)} className="btn-edit">Edit</button>
                      <button onClick={() => deleteMutation.mutate(p._id)} className="btn-delete">Delete</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // 👇 SORRY MESSAGE
            !isLoading && (
                <div className="no-result">
                    <h3>😞 Sorry, No Products Found!</h3>
                    <p>Try searching for something else.</p>
                </div>
            )
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default App;