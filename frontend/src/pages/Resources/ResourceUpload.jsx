import React, { useState } from 'react';
import { uploadResource } from '../../api/resourceApi';
import useApi from '../../hooks/useApi';

const ResourceUploadPage = () => {
  const { loading, execute: handleUpload } = useApi(uploadResource);
  const [formData, setFormData] = useState(new FormData());
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const resourceTypes = ['Lecture Note', 'Past Paper', 'Assignment', 'Other'];
  const [formFields, setFormFields] = useState({
    title: '',
    description: '',
    courseCode: '',
    resourceType: resourceTypes[0],
    institute: '',
  });


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(null);
    
    Object.keys(formFields).forEach(key => {
        formData.set(key, formFields[key]);
    });
    
    if (!formData.get('resourceFile')) {
        setError('Please select a file to upload.');
        return;
    }

    try {
      await handleUpload(formData);
      setMessage('Upload successful! The resource is now pending approval by the moderators.');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Check file size or server status.');
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'resourceFile' && files) {
      formData.set(name, files[0]);
    } else {
      setFormFields(prev => ({ ...prev, [name]: value }));
    }
  };

  const inputStyle = { backgroundColor: '#FFFFFF', borderColor: '#274d60', color: '#274d60' };


  return (
    <div className="resource-upload-page container max-w-xl mx-auto p-8 bg-primary-bg shadow-xl rounded-lg mt-10 text-primary-text">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary-text">Upload New Resource</h1>
      <form onSubmit={handleSubmit}>
        
        <input 
            className="form-control" 
            name="title" 
            placeholder="Title" 
            onChange={handleChange} 
            required 
            style={inputStyle}
        />
        
        <input 
            className="form-control" 
            name="courseCode" 
            placeholder="Subject/Course Code" 
            onChange={handleChange} 
            required 
            style={inputStyle}
        />

        <select
            className="form-control"
            name="resourceType"
            onChange={handleChange}
            value={formFields.resourceType}
            required
            style={inputStyle}
        >
            {resourceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
            ))}
        </select>
        
        <input 
            className="form-control" 
            name="institute" 
            placeholder="Institute Name" 
            onChange={handleChange} 
            required 
            style={inputStyle}
        />

        <textarea 
            className="form-control" 
            name="description" 
            placeholder="Brief Description" 
            onChange={handleChange} 
            required 
            rows="3"
            style={inputStyle}
        />
        
        <div className="mb-4">
            <label className="block text-sm font-medium text-primary-text mb-1">Select File (PDF, DOCX, etc.)</label>
            <input type="file" name="resourceFile" onChange={handleChange} required className="text-primary-text" />
        </div>
        
        <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Resource'}
        </button>
      </form>
      
      {message && <p className="mt-4 text-center font-semibold text-accent-yellow">{message}</p>}
      {error && <p className="mt-4 text-center font-semibold text-red-400">Error: {error}</p>}
    </div>
  );
};

export default ResourceUploadPage;