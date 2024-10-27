import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import './ViewProfile.css'; 
import { useNavigate } from 'react-router-dom';
import { db, auth, storage } from './firebase'; 
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut, onAuthStateChanged } from 'firebase/auth';

function ViewProfile() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [Contact, setContact] = useState('');
  const [profilePicture, setProfilePicture] = useState(null); // Store profile picture URL
  const [imageUpload, setImageUpload] = useState(null); // Store selected image
  const [previewUrl, setPreviewUrl] = useState(null); // Store preview URL
  const [isUploading, setIsUploading] = useState(false); // State to track upload progress

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
        setUser(user);
      } else {
        setLoggedIn(false);
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user) {
          const q = query(collection(db, 'organization'), where('orgEmail', '==', user.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const orgDoc = querySnapshot.docs[0];
            const orgData = { id: orgDoc.id, ...orgDoc.data() }; // Add the ID to the profile data
            setProfileData(orgData);
            setContact(orgData.orgContact);
            setProfilePicture(orgData.orgProfilePicture || null); // Set profile picture
          } else {
            console.log('No organization found for the current user.');
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleImageUpload = async () => {
    if (!imageUpload) {
      console.error('No image file selected');
      return;
    }

    setIsUploading(true);

    try {
      const imageRef = ref(storage, `orgProfilePictures/${user.uid}`);
      await uploadBytes(imageRef, imageUpload);
      const downloadURL = await getDownloadURL(imageRef);

      if (profileData && profileData.id) {
        const docRef = doc(db, 'organization', profileData.id);
        await updateDoc(docRef, { orgProfilePicture: downloadURL });
        setProfilePicture(downloadURL);
      } else {
        console.error('Profile data or ID is undefined:', profileData);
      }

      setImageUpload(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setImageUpload(file);
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-classname-container">
      <nav className="navbar">
        <div className="navbar-left">
          <img src="/fundedfutureslogo.png" alt="Funded Futures" className="logo" onClick={() => navigate(`/app`)} />
        </div>
        <div className="navbar-right">
          <div className="user-icon-container" ref={dropdownRef} onClick={() => setShowDropdown(!showDropdown)}>
            <FaUserCircle className="icon" />
            {showDropdown && (
              <div className="user-dropdown">
                {loggedIn ? (
                  <>
                    <p className="username">{user?.email}</p>
                    <button onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <button onClick={() => navigate('/')}>Log in</button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="profile-classname-content">
        {profileData ? (
          <div className="profile-classname-card">
            <FaArrowLeft className="back-arrow" onClick={() => navigate('/app')} />
            <div className="profile-classname-picture">
              <label htmlFor="imageUploadInput" className="upload-label" style={{ cursor: 'pointer' }}>
                {previewUrl ? (
                  <>
                    {isUploading ? (
                      <div className="loading-overlay">
                        <div className="spinner"></div>
                      </div>
                    ) : null}
                    <img src={previewUrl} alt="Profile Preview" className="profile-picture" />
                  </>
                ) : profilePicture ? (
                  <>
                    {isUploading ? (
                      <div className="loading-overlay">
                        <div className="spinner"></div>
                      </div>
                    ) : null}
                    <img src={profilePicture} alt="Profile" className="profile-picture" />
                  </>
                ) : (
                  <FaUserCircle className="profile-icon" />
                )}
                <input
                  type="file"
                  id="imageUploadInput"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="button-container">
              {imageUpload && <button className="pfp-button" onClick={handleImageUpload}>Save Profile Picture</button>}
            </div>

            <div className="profile-classname-info">
              <p>Organization Name: {profileData.orgName}</p>
              <p>Username: {profileData.orgUsername}</p>
              <p>Email: {profileData.orgEmail}</p>
              <p>Type: {profileData.orgType}</p>
              <p>Date Joined: {profileData.orgDateJoined}</p>

              <div className="profile-classname-editable">
                <label htmlFor="contact">Contact:</label>
                <span>{Contact}</span>
                <div>
                  <button>Change Contact Number</button>
                </div>
              </div>

              <div className="profile-classname-editable">
                <label htmlFor="password">Password:</label>
                <span>**********</span>
                <div>
                  <button>Change Password</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>Working on it...</p>
        )}
      </div>
    </div>
  );
}

export default ViewProfile;
