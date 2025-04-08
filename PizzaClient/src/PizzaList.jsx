import { useState, useEffect } from 'react';

function PizzaList({ name, data, onCreate, onUpdate, onDelete, error }) {
  const [formData, setFormData] = useState({ 
    id: '', 
    name: '', 
    description: '', 
    baseId: 1, 
    toppings: [] 
  });
  const [editingId, setEditingId] = useState(null);
  const [bases, setBases] = useState([]);
  const [toppingInput, setToppingInput] = useState('');
  
  // Fetch pizza bases
  useEffect(() => {
    fetch('/api/pizzas/bases')
      .then(response => {
        if (!response.ok) {
          // If the endpoint doesn't exist, use a default base
          console.warn('Bases endpoint not available, using default');
          setBases([{ id: 1, name: 'Regular' }]);
          return null;
        }
        return response.json();
      })
      .then(data => {
        if (data) setBases(data);
      })
      .catch(error => {
        console.error('Error fetching bases:', error);
        setBases([{ id: 1, name: 'Regular' }]);
      });
  }, []);
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddTopping = () => {
    if (toppingInput.trim()) {
      setFormData(prevData => ({
        ...prevData,
        toppings: [...prevData.toppings, toppingInput.trim()]
      }));
      setToppingInput('');
    }
  };

  const handleRemoveTopping = (index) => {
    setFormData(prevData => ({
      ...prevData,
      toppings: prevData.toppings.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editingId) {
      onUpdate(formData);
      setEditingId(null);
    } else {
      onCreate(formData);
    }
    setFormData({ id: '', name: '', description: '', baseId: 1, toppings: [] });
    setToppingInput('');
  };  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description,
      baseId: item.baseId || 1,
      toppings: item.toppings || []
    });
    console.log('Editing pizza with baseId:', item.baseId);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ id: '', name: '', description: '', baseId: 1, toppings: [] });
    setToppingInput('');
  };

  return (
    <div>
      <h2>New {name}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleFormChange}
          />
        </div>
        <div>
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleFormChange}
          />
        </div>
        <div>          <label>
            Base:
            <select 
              name="baseId" 
              value={formData.baseId} 
              onChange={(e) => {
                // Parse the value as a number
                const baseId = parseInt(e.target.value, 10);
                setFormData(prev => ({
                  ...prev,
                  baseId
                }));
                console.log('Selected baseId:', baseId);
              }}
            >
              {bases.map(base => (
                <option key={base.id} value={base.id}>{base.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <div>
            <h4>Toppings:</h4>
            <div>
              <input
                type="text"
                value={toppingInput}
                onChange={(e) => setToppingInput(e.target.value)}
                placeholder="Add a topping"
              />
              <button type="button" onClick={handleAddTopping}>Add</button>
            </div>
            {formData.toppings.length > 0 && (
              <ul>
                {formData.toppings.map((topping, index) => (
                  <li key={index}>
                    {topping}
                    <button type="button" onClick={() => handleRemoveTopping(index)}>✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
        {editingId && <button type="button" onClick={handleCancelEdit}>Cancel</button>}
      </form>
      {error && <div>{error.message}</div>}
      <h2>{name}s</h2>
      <ul>
        {data.map(item => (
          <li key={item.id}>
            <div>
              <strong>{item.name}</strong> - {item.description}
              {item.base && <span> (Base: {item.base.name})</span>}
            </div>
            {item.toppings && item.toppings.length > 0 && (
              <div>Toppings: {item.toppings.join(', ')}</div>
            )}
            <div>
              <button onClick={() => handleEdit(item)}>Edit</button>
              <button onClick={() => onDelete(item.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PizzaList;