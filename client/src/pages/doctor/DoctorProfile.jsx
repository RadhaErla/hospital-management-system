import React, { useState, useEffect } from 'react';
import { User, Stethoscope, Phone, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const DoctorProfile = () => {
  const { user, updateUser } = useAuth();
  const [doctorId, setDoctorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [consultationFee, setConsultationFee] = useState(50);
  const [roomNumber, setRoomNumber] = useState('');
  const [bio, setBio] = useState('');
  const [qualifications, setQualifications] = useState('');

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/auth/me');
        if (res.data.success) {
          const u = res.data.data.user;
          const d = res.data.data.profile;
          setName(u.name || '');
          setPhone(u.phone || '');
          if (d) {
            setDoctorId(d._id);
            setSpecialization(d.specialization || '');
            setConsultationFee(d.consultationFee || 50);
            setRoomNumber(d.roomNumber || '');
            setBio(d.bio || '');
            setQualifications(d.qualifications?.join(', ') || '');
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    try {
      setSaving(true);
      const res = await api.put(`/doctors/${doctorId}`, {
        name,
        phone,
        specialization,
        consultationFee: Number(consultationFee),
        roomNumber,
        bio,
        qualifications: qualifications.split(',').map((s) => s.trim()).filter(Boolean),
      });

      if (res.data.success) {
        updateUser({ name, phone });
        setMsg({ type: 'success', text: 'Doctor profile updated successfully!' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    try {
      setSaving(true);
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setCurrentPassword('');
        setNewPassword('');
        setMsg({ type: 'success', text: 'Password changed successfully!' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader message="Loading physician profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Physician Profile & Clinical Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage clinical credentials, consultation fee, room designation, and account security
        </p>
      </div>

      {msg.text && (
        <div
          className={`flex items-center gap-2 p-3.5 text-xs rounded-xl border ${
            msg.type === 'success'
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : 'text-rose-700 bg-rose-50 border-rose-200'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        <Card title="Physician Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Specialization *
              </label>
              <input
                type="text"
                required
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Consultation Fee ($) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Clinic Room / Suite
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Qualifications (comma-separated)
              </label>
              <input
                type="text"
                placeholder="MBBS, MD, FACC"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Professional Bio & Clinical Focus
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end">
            <Button variant="primary" type="submit" isLoading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </Card>
      </form>

      {/* Change Password */}
      <form onSubmit={handleChangePassword}>
        <Card title="Account Security & Password">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password *
              </label>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
            <Button variant="outline" type="submit" isLoading={saving}>
              Update Password
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
