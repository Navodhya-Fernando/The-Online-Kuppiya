import React, { useState } from 'react';
import { uploadResource } from '../../api/resourceApi';
import useApi from '../../hooks/useApi';

const ResourceUploadPage = () => {
  const { loading, error, execute: handleUpload } = useApi(uploadResource);
  const [formData] = useState(new FormData());
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      await handleUpload(formData);
      setMessage('File uploaded successfully! Check your database.');
      // Clear form logic here
    } catch (err) {
      setMessage(`Upload failed: ${error || 'Check server logs.'}`);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'resourceFile' && files) {
      formData.set(name, files[0]);
    } else {
      formData.set(name, value);
    }
  };

  return (
    <div className="resource-upload-page container max-w-xl mx-auto p-8 bg-white shadow-xl rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">Upload New Resource</h1>
      <form onSubmit={handleSubmit}>
        <input className="form-control" name="title" placeholder="Title of the Document" onChange={handleChange} required />
        <textarea className="form-control" name="description" placeholder="Brief Description" onChange={handleChange} required rows="4" />
        <input className="form-control" name="courseCode" placeholder="Course Code (e.g., ADDS242F)" onChange={handleChange} required />
        
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select File (PDF, DOCX, etc.)</label>
            <input type="file" name="resourceFile" onChange={handleChange} required />
        </div>
        
        <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Resource'}
        </button>
      </form>
      
      {message && <p className="mt-4 text-center font-semibold text-green-600">{message}</p>}
      {error && <p className="mt-4 text-center font-semibold text-red-600">Error: {error}</p>}
    </div>
  );
};

export default ResourceUploadPage;