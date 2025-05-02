import React, { useRef } from 'react';
import { FaUserCircle, FaCamera } from 'react-icons/fa';
import { useSelector } from 'react-redux';

function UserDetails() {

    const {user} = useSelector((state) => state.user)

    const fileInputRef = useRef(null);

    const handleProfileChange = () => {
        // Open the file picker when profile image is clicked
        fileInputRef.current.click();
    };

    const handleImageUpload = (event) => {
        console.log("here");
        const file = event.target.files[0];
        if (!file) return;

        // Static logic for image upload (no backend request here)
        console.log('Uploading image: ', file.name);
    };

    return (
        <div className="flex items-center p-5 bg-white py-5">
            <div className="relative mr-4" onClick={handleProfileChange}>
                {user?.profilePhoto ? (
                    <div className="relative w-16 h-16">
                        <img
                            src={`${user.profilePhoto}`}  // Static profile photo URL
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        {/* Overlay with camera icon */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 rounded-full transition-opacity">
                            <FaCamera className="text-secondary text-1xl" />
                        </div>
                    </div>
                ) : (
                    <FaUserCircle size={75} className="bg-white text-secondary cursor-pointer" />
                )}
            </div>
            <div>
                <h2 className="text-xl font-semibold">{user?.username?user.username:""}</h2>
                <p>{user?.email?user.email:""}</p>
                <p>{user?.phone?user.phone:""}</p>
            </div>

            {/* Hidden file input for uploading the image */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageUpload}
            />
        </div>
    );
}

export default UserDetails;
