import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const JournalApp = () => {
    const [entries, setEntries] = useState([]);
    const [content, setContent] = useState('');
    const [editingId, setEditingId] = useState(null);

    const fetchEntries = async () => {
        const res = await axios.get('http://localhost:5000/entries');
        setEntries(res.data);
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) {
            await axios.put(`http://localhost:5000/entries/${editingId}`, { content });
            setEditingId(null);
        } else {
            await axios.post('http://localhost:5000/entries', { content });
        }
        setContent('');
        fetchEntries();
    };

    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:5000/entries/${id}`);
        fetchEntries();
    };

    const handleEdit = (entry) => {
        setContent(entry.content);
        setEditingId(entry.id);
    };

    return (
        <div className="container">
            <h1 className="title">AI-Powered Journal with Mood Analysis</h1>
            <form onSubmit={handleSubmit} className="form">
                <textarea
                    className="textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your thoughts..."
                    required
                />
                <button type="submit" className="submit-button">{editingId ? 'Update Entry' : 'Add Entry'}</button>
            </form>
            <ul className="entries-list">
                {entries.map((entry) => (
                    <li key={entry.id} className="entry-item">
                        <p className="entry-content">{entry.content}</p>
                        <p className="entry-sentiment">Sentiment: {entry.sentiment}</p>
                        <div className="button-container">
                            <button onClick={() => handleEdit(entry)} className="edit-button">Edit</button>
                            <button onClick={() => handleDelete(entry.id)} className="delete-button">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default JournalApp;
