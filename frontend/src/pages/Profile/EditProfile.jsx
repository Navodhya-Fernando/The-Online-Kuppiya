import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../../components/shared/Spinner';
import { updateUserProfile } from '../../api/authApi';

const EditProfile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', university: '', degree: '', year: '', bio: '', avatar: '👤'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                university: user.university || '',
                degree: user.degree || '',
                year: user.year || '',
                bio: user.bio || '',
                avatar: user.avatar || '👤'
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserProfile(formData);
            updateUser({ ...user, ...formData });
            navigate('/profile');
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 text-gray-100">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
                <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-700">
                    
                    {/* Section: Identity */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-blue-400">Public Identity</h3>
                        <input name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg border border-gray-700" />
                        <textarea name="bio" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg border border-gray-700" placeholder="A brief bio..." />
                    </div>

                    {/* Section: Academic */}
                    <div className="pt-8 space-y-4">
                        <h3 className="text-lg font-semibold text-blue-400">Academic Context</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input name="university" value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} className="bg-gray-800 p-3 rounded-lg border border-gray-700" />
                            <input name="degree" value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} className="bg-gray-800 p-3 rounded-lg border border-gray-700" />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500">
                        {loading ? <Spinner /> : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;