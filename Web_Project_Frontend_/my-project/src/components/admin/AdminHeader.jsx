import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaUser, FaFilm, FaClipboardList } from 'react-icons/fa';
import { getCachedProfile, getCurrentProfile } from '../../services/profile/ProfileService';

function AdminHeader() {
    const navigator = useNavigate();
    const [profile, setProfile] = useState(() => {
        const cached = getCachedProfile();
        return { name: cached?.name || 'Admin', photo: cached?.photo || '' };
    });

    useEffect(() => {
        getCurrentProfile()
            .then((data) => setProfile({ name: data?.name || 'Admin', photo: data?.photo || '' }))
            .catch(() => {});

        const onProfileUpdated = (event) => {
            setProfile((prev) => ({
                name: event.detail?.name || prev.name,
                photo: event.detail?.photo || prev.photo,
            }));
        };
        window.addEventListener('profile-updated', onProfileUpdated);
        return () => window.removeEventListener('profile-updated', onProfileUpdated);
    }, []);

    return (
        <header className="mh-header">
            <div className="mh-container py-3 flex items-center gap-3">
                <div className="shrink-0">
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-violet-300">MovieHub</p>
                        <p className="font-bold">Admin Portal</p>
                    </div>
                </div>
                <nav className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <Button
                            onClick={() => navigator('/admin/adminDashboard')}
                            icon={<FaTachometerAlt />}
                            label="Dashboard"
                        />
                        <Button
                            onClick={() => navigator('/admin/userManagement')}
                            icon={<FaUsers />}
                            label="Users"
                        />
                        <Button
                            onClick={() => navigator('/admin/sellerManagement')}
                            icon={<FaUser />}
                            label="Sellers"
                        />
                        <Button
                            onClick={() => navigator('/admin/seller/approveMovies')}
                            icon={<FaFilm />}
                            label="Movies Management"
                        />
                        <Button
                            onClick={() => navigator('/admin/subscriptionManagement')}
                            icon={<FaClipboardList />}
                            label="Subscriptions"
                        />
                        <Button
                            onClick={() => navigator('/admin/notifications')}
                            icon={<FaClipboardList />}
                            label="Notifications"
                        />
                    </div>
                </nav>
                <div className="shrink-0 flex items-center gap-2">
                    <button
                        onClick={() => navigator('/admin/management')}
                        className="mh-btn-secondary inline-flex items-center gap-2 max-w-[150px] px-3 py-2 text-sm"
                    >
                        {profile.photo ? (
                            <img src={profile.photo} alt={profile.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                            <span className="w-6 h-6 rounded-full bg-violet-600 text-xs flex items-center justify-center text-white">
                                {(profile.name || 'A').slice(0, 1).toUpperCase()}
                            </span>
                        )}
                        <span className="truncate">{profile.name || 'Admin'}</span>
                    </button>
                    <button
                        onClick={() => navigator('/logout')}
                        className="mh-btn-danger px-3 py-2 text-sm"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}

function Button({ onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className="mh-btn-secondary shrink-0 px-3 py-2 text-sm"
        >
            {icon && <span className="mr-2">{icon}</span>}
            {label}
        </button>
    );
}

export default AdminHeader;
