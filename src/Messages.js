import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Dialog } from '@headlessui/react';
import { FaUserCircle } from 'react-icons/fa';
import { db, auth } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import './Messages.css';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [programName, setProgramName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
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
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
    
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, where('receiver', '==', user.email));
    
      try {
        const querySnapshot = await getDocs(q);
        const fetchedMessages = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
    
            const studentQuery = query(
              collection(db, 'students'),
              where('email', '==', data.sender)
            );
    
            const studentSnapshot = await getDocs(studentQuery);
            let studentId = null;
            let senderEmail = data.sender;
    
            if (!studentSnapshot.empty) {
              const studentDoc = studentSnapshot.docs[0];
              studentId = studentDoc.id;
              senderEmail = studentDoc.data().email;
            }
    
            return {
              id: doc.id,
              ...data,
              senderId: studentId,
              senderEmail,
              fileId: data.fileId || [] 
            };
          })
        );
    
        setMessages(fetchedMessages.sort((a, b) => b.dateSent - a.dateSent));
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    
    fetchMessages();
  }, [user]);

  const fetchProgramName = async (offerId) => {
    try {
      const programDoc = await getDoc(doc(db, 'scholarships', offerId));
      if (programDoc.exists()) {
        setProgramName(programDoc.data().programName);
      }
    } catch (error) {
      console.error('Error fetching program name:', error);
    }
  };

  const handleMessageClick = async (message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    await fetchProgramName(message.offerId);
  
    if (!message.messageStatus) {
      const messageRef = doc(db, 'messages', message.id);
      try {
        await updateDoc(messageRef, {
          messageStatus: true,
        });
        setMessages(
          messages.map((msg) =>
            msg.id === message.id ? { ...msg, messageStatus: true } : msg
          )
        );
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    }
  
    if (message.fileId?.length > 0 && message.senderId) {
      const storage = getStorage();
      const filePath = `${message.senderId}/${message.offerId}/${message.fileId}`;
      const fileRef = ref(storage, filePath);
  
      try {
        const fileUrl = await getDownloadURL(fileRef);
        setSelectedMessage((prev) => ({ ...prev, fileUrl }));
      } catch (error) {
        if (error.code === 'storage/object-not-found') {
          console.warn(`File does not exist: ${filePath}`);
        } else {
          console.error('Error fetching file URL:', error);
        }
      }
    } else {
    }
  };
  
  const handleReply = (offerId, senderId) => {
    if (!senderId) {
      console.error('Student not found');
      return;
    }
    navigate(`/studentProfile/${offerId}/${senderId}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return format(timestamp.toDate(), 'MMMM dd, yyyy hh:mm a');
  };

  return (
    <div className="msg-page">
      <nav className="msg-navbar">
        <div className="msg-navbar-left">
          <img 
            src="/images/fundedfutureslogo.png" 
            alt="Funded Futures" 
            className="msg-logo" 
            onClick={() => navigate(`/app`)} 
          />
        </div>
        <div className="msg-navbar-right">
          <div 
            className="msg-user-icon-container" 
            ref={dropdownRef}
          >
            <FaUserCircle 
              className="msg-icon" 
              onClick={() => setShowDropdown(!showDropdown)} 
            />
            {showDropdown && (
              <div className="user-dropdown">
                {loggedIn && (
                  <>
                    <p className="msg-username">{user?.email}</p>
                    <button onClick={handleLogout}>Logout</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="msg-container">
        <h1 className="msg-title">Messages</h1>
        
        <div className="msg-list">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => handleMessageClick(message)}
              className={`msg-item ${!message.messageStatus ? 'msg-item-unread' : ''}`}
            >
              <div className="msg-item-content">
                <div className="msg-item-info">
                  <p className={`msg-sender ${!message.messageStatus ? 'msg-sender-unread' : ''}`}>
                    From: {message.senderEmail}
                  </p>
                  <p className={`msg-subject ${!message.messageStatus ? 'msg-subject-unread' : ''}`}>
                    {message.subject}
                  </p>
                </div>
                <div className="msg-date">
                  {!message.messageStatus && <div className="msg-unread-indicator" />}
                  {formatDate(message.dateSent)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="msg-modal-overlay"
        >
          <div className="msg-modal">
            {selectedMessage && (
              <>
                <div className="msg-modal-header">
                  <p className="msg-modal-meta">{formatDate(selectedMessage.dateSent)}</p>
                  <p className="msg-modal-meta">From: {selectedMessage.sender}</p>
                  <p className="msg-modal-meta">To: {selectedMessage.receiver}</p>
                  <h3 className="msg-modal-meta">{programName}</h3>
                  <h3 className="msg-modal-subject">{selectedMessage.subject}</h3>
                </div>
                
                <div className="msg-modal-body">
                  {selectedMessage.body}
                </div>

                {selectedMessage.fileUrl && (
                  <div className="msg-modal-file">
                    <a
                      href={selectedMessage.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="msg-file-link"
                    >
                      {selectedMessage.fileId}
                    </a>
                  </div>
                )}

                <div className="msg-modal-actions">
                  <button
                    onClick={() => handleReply(selectedMessage.offerId, selectedMessage.senderId)}
                    className="msg-btn msg-btn-primary"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="msg-btn msg-btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default Messages;