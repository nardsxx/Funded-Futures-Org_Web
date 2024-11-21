import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaArrowLeft, FaCamera } from 'react-icons/fa';
import './ViewProfile.css'; 
import { useNavigate } from 'react-router-dom';
import { db, auth, storage } from './firebase'; 
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { ClipLoader } from 'react-spinners';
import { format } from 'date-fns';

function ViewProfile() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null); 
  const [imageUpload, setImageUpload] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null); 
  const [isUploading, setIsUploading] = useState(false); 

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
            const orgData = { id: orgDoc.id, ...orgDoc.data() }; 
            setProfileData(orgData);
            setProfilePicture(orgData.orgProfilePicture || null); 
          } else {
            
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
          <img src="/images/fundedfutureslogo.png" alt="Funded Futures" className="logo" onClick={() => navigate(`/app`)} />
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
                  null
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="profile-classname-content">
        {profileData ? (
          <div className="profile-classname-card">
            <FaArrowLeft className="back-arrow" onClick={() => navigate(-1)} />

            <div className="profile-classname-picture">
              {previewUrl ? (
                <>
                  {isUploading && (
                    <div className="loading-overlay">
                      <ClipLoader color="#FFD700" size={50} />
                    </div>
                  )}
                  <img
                    src={previewUrl}
                    alt="Profile Preview"
                    className="profile-picture"
                    onClick={() => console.log('Viewing preview image')}
                  />
                </>
              ) : profilePicture ? (
                <>
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="profile-picture"
                    onClick={() => console.log('Viewing profile picture')}
                  />
                  <label htmlFor="imageUploadInput" className="upload-label camera-icon-container">
                    <FaCamera className="camera-icon" />
                  </label>
                </>
              ) : (
                <>
                  <FaUserCircle className="profile-icon" />
                  <label htmlFor="imageUploadInput" className="upload-label camera-icon-container">
                    <FaCamera className="camera-icon" />
                  </label>
                </>
              )}
              <input
                type="file"
                id="imageUploadInput"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            <div className="button-container">
              {imageUpload && <button className="pfp-button" onClick={handleImageUpload}>Save Profile Picture</button>}
            </div>

  <div className="profile-info-container">
    <table className="profile-info-table">
      <tbody>
        <tr>
          <td><strong>Organization Name:</strong></td>
          <td>{profileData.orgName}</td>
        </tr>
        <tr>
          <td><strong>Username:</strong></td>
          <td>{profileData.orgUsername}</td>
        </tr>
        <tr>
          <td><strong>Email:</strong></td>
          <td>{profileData.orgEmail}</td>
        </tr>
        <tr>
          <td><strong>Type:</strong></td>
          <td>{profileData.orgType}</td>
        </tr>
        <tr>
          <td><strong>Date Joined:</strong></td>
          <td>{profileData.orgDateJoined ? format(new Date(profileData.orgDateJoined), 'MMMM dd, yyyy') : 'N/A'}</td>
        </tr>
        <tr>
          <td><strong>Contact:</strong></td>
          <td>{profileData.orgContact}</td>
        </tr>
        <tr>
          <td colSpan="2" className={profileData.orgVerification ? "verified-text" : "not-verified-text"}>
            {profileData.orgVerification
              ? "Your account is verified."
              : "Your account is not yet verified. Please wait for admin approval."}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

          </div>
        ) : (
          <div className="spinner-container">
            <ClipLoader color="#4D4D4D" size={100} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewProfile;
